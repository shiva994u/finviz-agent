from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Elite Trader Stock Screener API"
    API_V1_STR: str = "/api/v1"
    
    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    
    # Finviz
    FINVIZ_API_KEY: str = "730d209f-e9bd-4861-882d-9fb1b5dd5382"
    
    class Config:
        case_sensitive = True

settings = Settings()
