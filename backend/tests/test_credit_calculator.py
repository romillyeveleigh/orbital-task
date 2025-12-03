"""
Tests for credit_calculator module.
"""

from credit_calculator import calculate_credits_from_text


class TestCalculateCreditsFromText:
    """Test credit calculation from text."""
    
    def test_empty_text_returns_minimum(self):
        """Empty text should return minimum 1.00 credits."""
        assert calculate_credits_from_text("") == 1.00
    
    def test_none_text_returns_minimum(self):
        """None text should return minimum 1.00 credits."""
        assert calculate_credits_from_text(None) == 1.00
    
    def test_short_text_returns_minimum(self):
        """Very short text should return minimum 1.00 credits."""
        assert calculate_credits_from_text("Hi") == 1.00
    
    def test_credits_rounded_to_two_decimals(self):
        """Credits should be rounded to 2 decimal places."""
        # Text that would result in non-round number
        text = "a" * 50  # 50 chars = 12.5 tokens = 5 credits
        result = calculate_credits_from_text(text)
        assert result == 5.00  # 12.5 tokens * 40 / 100 = 5.0
        assert isinstance(result, float)
    
    def test_calculation_formula(self):
        """Test the credit calculation formula."""
        # 400 characters = 100 tokens = 40 credits (at base rate)
        text = "a" * 400
        result = calculate_credits_from_text(text)
        assert result == 40.00
    
    def test_large_text_calculation(self):
        """Test calculation for larger text."""
        # 1000 characters = 250 tokens = 100 credits
        text = "a" * 1000
        result = calculate_credits_from_text(text)
        assert result == 100.00
    
    def test_custom_base_model_rate(self, monkeypatch):
        """Test with custom BASE_MODEL_RATE from environment."""
        monkeypatch.setenv("BASE_MODEL_RATE", "50")
        # Need to reload the module to pick up the new env var
        import importlib
        import credit_calculator
        importlib.reload(credit_calculator)
        
        # 400 characters = 100 tokens = 50 credits (at custom rate)
        text = "a" * 400
        result = credit_calculator.calculate_credits_from_text(text)
        assert result == 50.00
        
        # Restore default
        monkeypatch.delenv("BASE_MODEL_RATE", raising=False)
        importlib.reload(credit_calculator)
    
    def test_minimum_always_applies(self):
        """Minimum cost of 1.00 should always apply."""
        # Even very small text should return at least 1.00
        text = "x"
        result = calculate_credits_from_text(text)
        assert result >= 1.00
    
    def test_token_estimation(self):
        """Test that token estimation (1 token ≈ 4 chars) is correct."""
        # 4 characters = 1 token = 0.4 credits (but minimum is 1.00)
        text = "abcd"
        result = calculate_credits_from_text(text)
        assert result == 1.00  # Minimum applies
        
        # 40 characters = 10 tokens = 4 credits
        text = "a" * 40
        result = calculate_credits_from_text(text)
        assert result == 4.00  # 10 tokens * 40 / 100 = 4.0
        
        # 100 characters = 25 tokens = 10 credits
        text = "a" * 100
        result = calculate_credits_from_text(text)
        assert result == 10.00

