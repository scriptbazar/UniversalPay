const TermsOfService = () => {
    return (
      <div className="flex justify-center">
        <div className="p-6 max-w-4xl text-gray-800">
          <h1 className="text-3xl font-bold mb-4 text-center">Terms of Service for UniversalPay</h1>
          <p className="text-sm text-gray-500 mb-6 text-center">Last updated: 8/7/2025</p>
  
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
            <p>
              Welcome to UniversalPay. These Terms of Service (“Terms”) govern your use of UniversalPay’s payment gateway services, website, APIs, and related applications (collectively, the “Service”). By creating an account or using any part of the Service, you agree to these Terms.
            </p>
          </section>
  
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">2. Acknowledgment</h2>
            <p>
              These Terms govern the relationship between You and UniversalPay. By accessing or using the Service, You acknowledge that You have read, understood, and agree to be bound by these Terms. If You do not agree with any part of these Terms, You may not use the Service.
            </p>
          </section>
  
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">3. User Accounts</h2>
            <p>
              You agree to provide accurate, complete, and current information during account creation and to keep your credentials secure. You are solely responsible for any activity under your account and must notify Us immediately of any unauthorized access or security breach.
            </p>
          </section>
  
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">4. Payments, Fees, and Settlements</h2>
            <h3 className="text-xl font-semibold mt-4">4.1 Transaction Fees</h3>
            <p>
              When you process a payment through UniversalPay, you are subject to our transaction fees, which will be disclosed at the time of the transaction or in your merchant dashboard. UniversalPay reserves the right to modify its fees with or without notice, subject to applicable law.
            </p>
  
            <h3 className="text-xl font-semibold mt-4">4.2 Settlements</h3>
            <p>
              All settlements are processed in your chosen cryptocurrency (e.g., USDT, BTC). You are responsible for providing a correct and secure wallet address. UniversalPay is not liable for losses incurred due to incorrect wallet addresses provided by you.
            </p>
  
            <h3 className="text-xl font-semibold mt-4">4.3 Network Fees</h3>
            <p>
              You are responsible for any blockchain network fees (e.g., "gas fees") associated with withdrawing funds from your UniversalPay account to your personal wallet.
            </p>
          </section>
  
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">5. Termination</h2>
            <p>
              We reserve the right to suspend or terminate Your account immediately and without notice if You violate these Terms or engage in fraudulent or abusive behavior.
            </p>
            <p>
              Upon termination, Your right to use the Service will cease immediately. If you wish to terminate Your account, you may simply stop using the Service.
            </p>
          </section>
  
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">6. "As Is" and "As Available" Disclaimer</h2>
            <p>
              The Service is provided “as is” and “as available,” without warranties of any kind. To the fullest extent permitted by law, UniversalPay disclaims all express or implied warranties, including merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </section>
  
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">7. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of [Your Country], without regard to conflict of law provisions. Your use of the Service may also be subject to other local, state, national, or international laws.
            </p>
          </section>
  
          <section>
            <h2 className="text-2xl font-semibold mb-2">8. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us via our support page:
            </p>
            <p>
              <a href="https://universalpay.com/support" className="text-blue-600 underline">https://universalpay.com/support</a>
            </p>
          </section>
        </div>
      </div>
    );
  };
  
  export default TermsOfService;
  