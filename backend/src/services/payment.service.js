class MockPaymentProvider {
  async processPayment(amount, method, details) {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate some logic, like checking amount
    if (amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    return {
      success: true,
      transactionId: `mock-txn-${Date.now()}`,
      status: 'COMPLETED',
      amount,
      method,
      timestamp: new Date()
    };
  }
}

module.exports = {
  MockPaymentProvider: new MockPaymentProvider()
};
