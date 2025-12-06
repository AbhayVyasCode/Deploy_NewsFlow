from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_community.tools import DuckDuckGoSearchResults
from app.core.config import settings
from typing import List, Optional
import json

def get_llm():
    """Get Gemini LLM instance"""
    if not settings.GOOGLE_API_KEY:
        return None
    return ChatGoogleGenerativeAI(
        # Requested lightweight model; change here if you upgrade quota
        model="gemini-2.0-flash-lite",
        google_api_key=settings.GOOGLE_API_KEY,
        temperature=0.7
    )

async def chat_with_news(message: str, history: Optional[List[dict]] = None) -> dict:
    """Chat about news topics using Gemini with web search"""
    llm = get_llm()
    if not llm:
        return {
            "response": "AI chat is not available. Please configure GOOGLE_API_KEY.",
            "sources": []
        }
    
    try:
        # Search for relevant news first, but fail gracefully on rate limits/errors
        context = ""
        sources: List[str] = []
        has_search_results = False
        
        # Only search if the message seems to be asking about news/current events
        message_lower = message.lower()
        is_news_query = any(keyword in message_lower for keyword in [
            "news", "article", "summary", "latest", "recent", "today", "current", 
            "happening", "event", "story", "report", "update"
        ])
        
        if is_news_query or len(message) > 10:
            try:
                search_query = f"{message} news" if "news" not in message_lower else message
                search_tool = DuckDuckGoSearchResults(max_results=5)
                search_results = search_tool.invoke(search_query)

                items = []
                if isinstance(search_results, list):
                    items = search_results
                elif isinstance(search_results, str):
                    text = search_results.strip()
                    if text.startswith("["):
                        try:
                            items = json.loads(text)
                        except Exception:
                            try:
                                items = eval(text, {"__builtins__": {}}) if text.startswith("[") else []
                            except Exception:
                                items = []
                elif isinstance(search_results, dict):
                    possible_items = search_results.get("results") or search_results.get("data") or []
                    if isinstance(possible_items, list):
                        items = possible_items

                for item in items:
                    if item.get('title') and item.get('snippet'):
                        context += f"- {item.get('title', '')}: {item.get('snippet', '')}\n"
                        link = item.get("link")
                        if link and link.startswith("http"):
                            sources.append(link)
                        has_search_results = True
            except Exception as search_err:
                # Search failed, but we'll continue without it
                pass
        
        # Build conversation history
        system_content = """You are a helpful AI news assistant. You can:
1. Answer questions about current events and news topics
2. Provide summaries of news articles when asked
3. Discuss general topics related to news and current affairs
4. Be friendly and conversational

If you have search results, use them to provide accurate information. If you don't have specific search results, you can still answer general questions or provide helpful responses based on your knowledge. Always be helpful and informative."""
        
        messages = [SystemMessage(content=system_content)]
        
        if history:
            for msg in history[-5:]:  # Last 5 messages for context
                if msg.get("role") == "user":
                    messages.append(HumanMessage(content=msg.get("content", "")))
                else:
                    # Use AIMessage for assistant turns to avoid duplicate system msgs
                    messages.append(AIMessage(content=msg.get("content", "")))
        
        # Build prompt based on whether we have search results
        if has_search_results and context:
            prompt = f"""Recent news context from search:
{context}

User question: {message}

Please answer the user's question using the news context above. If the question asks for a summary, provide a concise summary."""
        else:
            # No search results, but still try to help
            if "summary" in message_lower and "article" in message_lower:
                prompt = f"""User is asking: {message}

The user wants a summary of an article. Since I don't have access to the specific article content, please explain that you'd need the article text or URL to provide a summary. However, if the user mentioned a topic (like "{message}"), you can provide general information about that topic."""
            else:
                prompt = f"""User question: {message}

Please answer the user's question helpfully. You can provide general information, discuss news topics, or help with questions about current events."""
        
        messages.append(HumanMessage(content=prompt))
        
        try:
            response = llm.invoke(messages)
            return {
                "response": response.content,
                "sources": sources[:3] if sources else []
            }
        except Exception as e:
            error_msg = str(e)
            # Provide a helpful response even if LLM fails
            if "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
                return {
                    "response": "I'm currently experiencing high demand. Please try again in a moment. In the meantime, you can browse the news feed for the latest articles!",
                    "sources": []
                }
            return {
                "response": f"I encountered a technical issue: {error_msg}. Please try rephrasing your question or try again later.",
                "sources": sources[:3] if sources else []
            }
    except Exception as e:
        return {
            "response": f"Sorry, I encountered an error: {str(e)}. Please try again or rephrase your question.",
            "sources": []
        }

async def generate_daily_digest(categories: Optional[List[str]] = None) -> dict:
    """Generate a daily news digest"""
    llm = get_llm()
    if not llm:
        return {
            "digest": "Daily digest is not available. Please configure GOOGLE_API_KEY.",
            "headlines": [],
            "generated_at": ""
        }
    
    try:
        from datetime import datetime
        
        cats = categories or ["Technology", "Business", "Science"]
        search_tool = DuckDuckGoSearchResults(max_results=15)
        
        # Search for news in each category
        all_news = []
        for cat in cats[:3]:  # Limit to 3 categories
            results = search_tool.invoke(f"{cat} news today")
            if isinstance(results, str):
                try:
                    items = eval(results) if results.startswith("[") else []
                    for item in items[:3]:  # Top 3 per category
                        all_news.append({
                            "category": cat,
                            "title": item.get("title", ""),
                            "snippet": item.get("snippet", "")
                        })
                except:
                    pass
        
        if not all_news:
            return {
                "digest": "No news available at this time.",
                "headlines": [],
                "generated_at": datetime.now().isoformat()
            }
        
        prompt = f"""Create a brief daily news digest from these stories:

{json.dumps(all_news, indent=2)}

Format your response as:
1. A brief 2-3 paragraph summary of the most important news
2. List the top 5 headlines

Be concise and engaging."""
        
        response = llm.invoke([
            SystemMessage(content="You are a news anchor creating a daily briefing."),
            HumanMessage(content=prompt)
        ])
        
        # Extract headlines (simple parsing)
        headlines = []
        for line in response.content.split("\n"):
            if line.strip().startswith(("-", "•", "*")) or (len(line) > 5 and line[0].isdigit()):
                headlines.append(line.strip().lstrip("-•*0123456789. "))
        
        return {
            "digest": response.content,
            "headlines": headlines[:5],
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        from datetime import datetime
        return {
            "digest": f"Error generating digest: {str(e)}",
            "headlines": [],
            "generated_at": datetime.now().isoformat()
        }
