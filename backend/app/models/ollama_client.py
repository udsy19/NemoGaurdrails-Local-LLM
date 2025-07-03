import httpx
import asyncio
from typing import Dict, Any, Optional, AsyncIterator
import json
from app.utils.logger import app_logger
from app.utils.exceptions import OllamaException

class OllamaClient:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.client = httpx.AsyncClient(
            timeout=120.0,
            headers={"Content-Type": "application/json"}
        )
        self.current_model = "llama3.1:latest"
        
    async def health_check(self) -> bool:
        try:
            response = await self.client.get(f"{self.base_url}/api/tags")
            return response.status_code == 200
        except Exception as e:
            app_logger.error(f"Ollama health check failed: {e}")
            return False
    
    async def list_models(self) -> Dict[str, Any]:
        try:
            response = await self.client.get(f"{self.base_url}/api/tags")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            app_logger.error(f"Failed to list Ollama models: {e}")
            raise OllamaException(f"Failed to list models: {e}")
    
    async def pull_model(self, model_name: str) -> bool:
        try:
            app_logger.info(f"Pulling Ollama model: {model_name}")
            
            payload = {"name": model_name}
            response = await self.client.post(
                f"{self.base_url}/api/pull",
                json=payload,
                timeout=600.0  # 10 minutes for model download
            )
            response.raise_for_status()
            
            # Parse streaming response
            for line in response.text.split('\n'):
                if line.strip():
                    try:
                        data = json.loads(line)
                        if "status" in data:
                            app_logger.info(f"Pull status: {data['status']}")
                        if data.get("status") == "success":
                            app_logger.info(f"Successfully pulled model: {model_name}")
                            return True
                    except json.JSONDecodeError:
                        continue
            
            return True
            
        except Exception as e:
            app_logger.error(f"Failed to pull model {model_name}: {e}")
            raise OllamaException(f"Failed to pull model {model_name}: {e}")
    
    async def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        system_prompt: Optional[str] = None,
        stream: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        try:
            model_name = model or self.current_model
            
            payload = {
                "model": model_name,
                "prompt": prompt,
                "stream": stream,
                **kwargs
            }
            
            if system_prompt:
                payload["system"] = system_prompt
            
            response = await self.client.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=120.0
            )
            response.raise_for_status()
            
            if stream:
                return {"response": response.text, "stream": True}
            else:
                return response.json()
                
        except Exception as e:
            app_logger.error(f"Failed to generate with Ollama: {e}")
            raise OllamaException(f"Generation failed: {e}")
    
    async def chat(
        self,
        messages: list,
        model: Optional[str] = None,
        stream: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        try:
            model_name = model or self.current_model
            
            payload = {
                "model": model_name,
                "messages": messages,
                "stream": stream,
                **kwargs
            }
            
            response = await self.client.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=120.0
            )
            response.raise_for_status()
            
            if stream:
                return {"response": response.text, "stream": True}
            else:
                return response.json()
                
        except Exception as e:
            app_logger.error(f"Failed to chat with Ollama: {e}")
            raise OllamaException(f"Chat failed: {e}")
    
    async def stream_generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> AsyncIterator[str]:
        try:
            model_name = model or self.current_model
            
            payload = {
                "model": model_name,
                "prompt": prompt,
                "stream": True,
                **kwargs
            }
            
            if system_prompt:
                payload["system"] = system_prompt
            
            async with self.client.stream(
                "POST",
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=120.0
            ) as response:
                response.raise_for_status()
                
                async for chunk in response.aiter_lines():
                    if chunk:
                        try:
                            data = json.loads(chunk)
                            if "response" in data:
                                yield data["response"]
                            if data.get("done", False):
                                break
                        except json.JSONDecodeError:
                            continue
                            
        except Exception as e:
            app_logger.error(f"Failed to stream generate with Ollama: {e}")
            raise OllamaException(f"Stream generation failed: {e}")
    
    async def check_model_exists(self, model_name: str) -> bool:
        try:
            models = await self.list_models()
            model_names = [model["name"] for model in models.get("models", [])]
            return model_name in model_names
        except Exception:
            return False
    
    async def ensure_model_available(self, model_name: str) -> bool:
        try:
            if not await self.check_model_exists(model_name):
                app_logger.info(f"Model {model_name} not found, pulling...")
                await self.pull_model(model_name)
            return True
        except Exception as e:
            app_logger.error(f"Failed to ensure model {model_name} is available: {e}")
            return False
    
    async def close(self):
        await self.client.aclose()