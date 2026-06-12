import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

interface Props {
  onNavigate: (page: any) => void;
  onLogout: () => void;
  user: any;
}

const TermsPage: React.FC<Props> = ({ onNavigate, onLogout, user }) => {
  return (
    <div className="min-h-screen bg-brand-black text-white">
      <Navigation onNavigate={onNavigate} onLogout={onLogout} activePage="terms" user={user} />
      <main className="max-w-3xl mx-auto px-6 py-24 space-y-10">
        <div>
          <p className="text-brand-cyan text-xs font-black uppercase tracking-widest italic mb-2">Legal</p>
          <h1 className="text-5xl font-black uppercase italic text-white tracking-tighter">Terms of Service</h1>
          <p className="text-white/40 text-sm mt-3">Last updated: June 2026</p>
        </div>

        {[
          {
            title: '1. About HahaHub',
            content: `HahaHub ("Platform", "we", "us") is an online marketplace operated by HahaHub, based in Ljubljana, Slovenia, that enables comedy theatre producers ("Users") to list, discover, and negotiate rights to comedy theatre productions internationally. HahaHub facilitates connections between rights holders and licensees but is not a party to any agreement concluded between Users.`
          },
          {
            title: '2. Acceptance of Terms',
            content: `By registering an account or using the Platform in any way, you agree to be bound by these Terms of Service. If you do not agree, you must not use the Platform. We reserve the right to update these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the revised Terms.`
          },
          {
            title: '3. Eligibility',
            content: `You must be at least 18 years old and have the legal capacity to enter into contracts to use HahaHub. By registering, you represent that you meet these requirements and that all information you provide is accurate and complete.`
          },
          {
            title: '4. User Accounts',
            content: `You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must notify us immediately at info@hahahub.art if you suspect any unauthorized use of your account. HahaHub reserves the right to suspend or terminate accounts that violate these Terms.`
          },
          {
            title: '5. Listings and Content',
            content: `By uploading a show listing, you represent and warrant that: (a) you hold or are authorized to license the rights to the listed production; (b) the information provided is accurate, complete, and not misleading; (c) the production qualifies as comedy theatre; (d) the listing does not infringe any third-party intellectual property rights. HahaHub reserves the right to remove any listing at its sole discretion without prior notice.`
          },
          {
            title: '6. Rights and Licensing',
            content: `HahaHub is a facilitating platform only. Any licensing agreement, royalty arrangement, or rights transfer is concluded directly between the rights holder and the licensee. HahaHub is not responsible for the negotiation, execution, or enforcement of any agreement between Users. Users are solely responsible for ensuring that their agreements comply with applicable law.`
          },
          {
            title: '7. Fees and Subscriptions',
            content: `HahaHub offers free (GIGL) and paid subscription plans (LAFF at €99/year, ROAR at €189/year). Paid subscriptions are billed annually. Fees are non-refundable except where required by applicable law. HahaHub does not charge commission on rights deals concluded through the Platform. Subscription prices may change with 30 days notice.`
          },
          {
            title: '8. Founding Members',
            content: `Founding Members are users personally invited by HahaHub during the private beta period who receive lifetime ROAR access free of charge. Founding Member status and its associated benefits are non-transferable. HahaHub reserves the right to modify Founding Member benefits with reasonable notice, but lifetime access will not be revoked except in cases of material breach of these Terms.`
          },
          {
            title: '9. Prohibited Conduct',
            content: `You must not: (a) list productions for which you do not hold rights; (b) use the Platform for any unlawful purpose; (c) transmit spam, unsolicited messages, or harmful content; (d) attempt to circumvent the Platform by conducting transactions off-platform after initial contact through HahaHub; (e) impersonate any person or entity; (f) scrape, copy, or reproduce Platform content without permission.`
          },
          {
            title: '10. Intellectual Property',
            content: `All content on the Platform — including the HahaHub brand, The Laff Exchange name, design, software, and text — is owned by HahaHub and protected by applicable intellectual property laws. You retain ownership of the content you upload but grant HahaHub a non-exclusive license to display it on the Platform.`
          },
          {
            title: '11. Disclaimer of Warranties',
            content: `The Platform is provided "as is" without warranties of any kind. HahaHub does not warrant that the Platform will be uninterrupted, error-free, or free of harmful components. HahaHub does not verify the accuracy of user-submitted content or the validity of rights claims made by Users.`
          },
          {
            title: '12. Limitation of Liability',
            content: `To the maximum extent permitted by law, HahaHub shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform, including but not limited to loss of revenue, loss of data, or loss of business opportunity. HahaHub's total liability to you shall not exceed the amount paid by you to HahaHub in the 12 months preceding the claim.`
          },
          {
            title: '13. Termination',
            content: `You may terminate your account at any time by contacting info@hahahub.art. HahaHub may terminate or suspend your account immediately for breach of these Terms. Upon termination, your right to use the Platform ceases immediately. Provisions that by their nature should survive termination will do so.`
          },
          {
            title: '14. Governing Law',
            content: `These Terms are governed by the laws of the Republic of Slovenia. Any disputes shall be subject to the exclusive jurisdiction of the courts of Ljubljana, Slovenia. If you are a consumer in the EU, you may also have rights under the law of your country of residence.`
          },
          {
            title: '15. Contact',
            content: `For any questions regarding these Terms, please contact us at: info@hahahub.art · HahaHub · Ljubljana, Slovenia`
          },
        ].map((section, i) => (
          <div key={i} className="border-l-2 border-white/10 pl-6 space-y-3">
            <h2 className="font-black uppercase italic text-white text-lg">{section.title}</h2>
            <p className="text-white/60 text-sm leading-relaxed">{section.content}</p>
          </div>
        ))}
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default TermsPage;
