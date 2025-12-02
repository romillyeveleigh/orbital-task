"""
Credit calculation module for messages without report_id.

Uses a simplified token estimation model:
- 1 token ≈ 4 characters
- Formula: credits = (estimated_tokens / 100) * base_model_rate
- base_model_rate = 40 credits per 100 tokens
- Minimum cost: 1.00 credits always applies
"""


def calculate_credits_from_text(text: str) -> float:
    """
    Calculate credits consumed for a message based on text length.
    
    Args:
        text: The message text to calculate credits for
        
    Returns:
        Credits used, rounded to 2 decimal places, minimum 1.00
    """
    if not text:
        return 1.00
    
    # Estimate tokens: 1 token ≈ 4 characters
    estimated_tokens = len(text) / 4
    
    # Calculate credits: (tokens / 100) * base_rate
    # base_model_rate = 40 credits per 100 tokens
    base_model_rate = 40
    credits = (estimated_tokens / 100) * base_model_rate
    
    # Apply minimum cost of 1.00
    credits = max(1.00, credits)
    
    # Round to 2 decimal places
    return round(credits, 2)

