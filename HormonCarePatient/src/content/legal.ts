export type LegalKind = 'terms' | 'privacy';

export type LegalSection = {
  title: string;
  body: string;
};

export type LegalDocument = {
  title: string;
  guTitle: string;
  intro: string;
  sections: LegalSection[];
  footer: string;
};

export const legalDocuments: Record<LegalKind, LegalDocument> = {
  terms: {
    title: 'Terms & Conditions',
    guTitle: 'નિયમો અને શરતો',
    intro:
      'Welcome to Hormon Care. By accessing or using this patient care platform, you agree to these Terms & Conditions. If you do not agree, please do not use the service.',
    sections: [
      {
        title: '1. Service purpose',
        body: 'Hormon Care helps your doctor share care plans, lifestyle assessments, weekly follow-ups, and educational content. It is a support tool and does not replace in-person medical advice, diagnosis, or emergency care.',
      },
      {
        title: '2. Patient account',
        body: 'Your Patient ID and password are issued by your clinic. Keep them confidential. You are responsible for activity under your account. Contact the clinic immediately if you suspect unauthorized access.',
      },
      {
        title: '3. Accurate information',
        body: 'Information you submit in assessments and follow-ups should be honest and complete to the best of your knowledge. Your care team may use this information to guide your plan.',
      },
      {
        title: '4. Content & unlock schedule',
        body: 'Plan content may unlock week-by-week or day-by-day as set by your doctor. Do not share protected media outside the app. Screenshots or redistribution of clinic content may be restricted.',
      },
      {
        title: '5. Medical disclaimer',
        body: 'Educational videos and written guidance are for informational support only. For urgent symptoms or medical emergencies, contact your doctor or local emergency services.',
      },
      {
        title: '6. Changes',
        body: 'We may update these terms from time to time. Continued use after changes means you accept the updated terms. For questions, contact your clinic.',
      },
    ],
    footer:
      'આ સેવા તમારા ડૉક્ટરની સારવારમાં સહાયરૂપ છે; તાત્કાલિક તબીબી મદદ માટે હંમેશા તમારા ડૉક્ટર અથવા ઇમરજન્સી સેવાનો સંપર્ક કરો.',
  },
  privacy: {
    title: 'Privacy Policy',
    guTitle: 'ગોપનીયતા નીતિ',
    intro:
      'Hormon Care respects your privacy. This policy explains what information we collect, how it is used, and how it is protected when you use the patient platform.',
    sections: [
      {
        title: '1. Information we collect',
        body: 'We may collect your name, Patient ID, care-plan progress, lifestyle assessment answers, weekly follow-up responses, and related clinical notes shared by your clinic.',
      },
      {
        title: '2. How we use information',
        body: 'Information is used to deliver your assigned plan, unlock content on schedule, support follow-ups, and help your doctor review progress. We do not sell your personal health information.',
      },
      {
        title: '3. Who can access your data',
        body: 'Authorized clinic staff (such as your doctor and admin users) can access records needed for your care. Technical operators may access systems for maintenance and security under confidentiality controls.',
      },
      {
        title: '4. Storage & security',
        body: 'Data is stored in secured databases with access controls. You should keep your login credentials private and use the app only on trusted devices.',
      },
      {
        title: '5. Cookies & sessions',
        body: 'We use session cookies/tokens so you can stay logged in securely while using the platform. These are required for authentication and are not used for advertising.',
      },
      {
        title: '6. Your choices',
        body: 'To correct account details, request access, or ask about deletion of records, contact your clinic. Some clinical records may be retained as required for medical and legal purposes.',
      },
      {
        title: '7. Updates',
        body: 'This privacy policy may be updated periodically. The latest version will be available in the app and on the website.',
      },
    ],
    footer:
      'તમારી તબીબી માહિતી ફક્ત સારવાર અને પ્લાન સપોર્ટ માટે વપરાય છે. વધુ માહિતી માટે તમારી ક્લિનિકનો સંપર્ક કરો.',
  },
};
