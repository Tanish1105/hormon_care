import type { PatientLocale } from "@/lib/patient-locale";
import { pickLocale } from "@/lib/patient-locale";

export const PUBLIC_LOCALE_KEY = "jeevanm-public-locale-v2";

export function publicSiteCopy(locale: PatientLocale) {
  const t = (en: string, gu: string) => pickLocale(locale, en, gu);

  return {
    navAria: t("Main menu", "મુખ્ય મેનૂ"),
    mobileNavAria: t("Mobile menu", "મોબાઇલ મેનૂ"),
    menuOpen: t("Open menu", "મેનૂ ખોલો"),
    menuClose: t("Close menu", "મેનૂ બંધ કરો"),
    nav: [
      { href: "#about", label: t("About", "અમારા વિશે") },
      { href: "#services", label: t("Services", "સેવાઓ") },
      { href: "#programs", label: t("Programs", "પ્રોગ્રામ") },
      { href: "#how", label: t("How it works", "કેવી રીતે") },
      { href: "#inquiry", label: t("Inquiry", "ઇન્ક્વાયરી") },
    ],
    portalLogin: t("Patient Login", "Patient Login"),
    portalMyPlan: t("My plan", "મારો પ્લાન"),
    heroKicker: t("Care for everyone", "બધા માટે કેર"),
    heroLine: t("A journey from habits to health", "આદતોને આરોગ્યમાં બદલવાની યાત્રા"),
    heroBody: t(
      "JEEVANM is for everyone. It is not a weight-loss plan. It helps you improve daily habits and build better ones — for your own health, for Garbh Sanskruti, and for children as they grow.",
      "JEEVANM બધા માટે છે. આ વેઇટ લોસ પ્લાન નથી. અહીં રોજિંદી આદતો સુધારવાની અને સારી આદતો બનાવવાની વાત છે — પોતાના આરોગ્ય માટે, ગર્ભ સંસ્કૃતિ માટે, અને બાળકોના ઉછેર માટે."
    ),
    ctaLogin: t("Patient login", "પેશન્ટ લોગિન"),
    ctaOpenPlan: t("Open my plan", "મારો પ્લાન ખોલો"),
    ctaServices: t("View services", "સેવાઓ જુઓ"),
    aboutKicker: t("About", "અમારા વિશે"),
    aboutTitle: t("What is JEEVANM?", "JEEVANM શું છે?"),
    aboutBody: t(
      "JEEVANM helps the whole family build better habits. Your plan, videos, assessments, and follow-ups live in one place so clinic guidance continues at home.",
      "JEEVANM આખા પરિવારને સારી આદતો બનાવવામાં મદદ કરે છે. ક્લિનિકમાં મળેલી સલાહને ઘરે અનુસરવા માટે એપમાં તમારો પ્લાન, વિડિયો, મૂલ્યાંકન અને ફોલોઅપ એક જ જગ્યાએ રહે છે."
    ),
    aboutCards: [
      {
        title: t("Connected to your doctor", "ડૉક્ટર સાથે જોડાયેલું"),
        body: t("Plans and content are prepared by your clinic.", "પ્લાન અને કન્ટેન્ટ તમારી ક્લિનિક તૈયાર કરે છે."),
      },
      {
        title: t("Habits into health", "આદતથી આરોગ્ય"),
        body: t(
          "Not weight loss — better sleep, food, routine, and daily habit building.",
          "વેઇટ લોસ નહીં — ઊંઘ, આહાર, રૂટિન અને રોજિંદી આદતો સુધારવી."
        ),
      },
      {
        title: t("Private and secure", "ખાનગી અને સુરક્ષિત"),
        body: t(
          "Your medical information is used only for care.",
          "તમારી તબીબી માહિતી ફક્ત સારવાર માટે વપરાય છે."
        ),
      },
      {
        title: t("Weekly unlocking content", "અઠવાડિયે ખુલતું કન્ટેન્ટ"),
        body: t(
          "New guidance each week, as your doctor schedules it.",
          "ડૉક્ટર નક્કી કરે તે મુજબ દર અઠવાડિયે નવું માર્ગદર્શન."
        ),
      },
    ],
    servicesKicker: t("Services", "સેવાઓ"),
    servicesTitle: t("What you get", "અહીં શું મળે છે"),
    servicesIntro: t(
      "Habit building for every person and every family — Arogya Sanskruti, Garbh Sanskruti, and Parenting Sanskruti.",
      "દરેક વ્યક્તિ અને દરેક પરિવાર માટે આદત નિર્માણ — આરોગ્ય સંસ્કૃતિ, ગર્ભ સંસ્કૃતિ અને પેરેન્ટિંગ સંસ્કૃતિ."
    ),
    services: [
      {
        title: t("Arogya Sanskruti", "આરોગ્ય સંસ્કૃતિ"),
        subtitle: t("આરોગ્ય સંસ્કૃતિ", "Arogya Sanskruti"),
        body: t(
          "This is not a weight-loss program. It is for improving daily habits and building better ones — food, sleep, movement, water, and routine — with week-by-week guidance.",
          "આ વેઇટ લોસ પ્રોગ્રામ નથી. રોજિંદી આદતો સુધારવા અને સારી આદતો બનાવવા માટે છે — આહાર, ઊંઘ, હલનચલન, પાણી અને રૂટિન — અઠવાડિયા મુજબની માર્ગદર્શિકા સાથે."
        ),
      },
      {
        title: t("Garbh Sanskruti", "ગર્ભ સંસ્કૃતિ"),
        subtitle: t("ગર્ભ સંસ્કૃતિ", "Garbh Sanskruti"),
        body: t(
          "From pregnancy itself, the family builds calm, food, rest, and daily habits so the baby’s growth starts on a healthy foundation.",
          "ગર્ભાવસ્થાથી જ પરિવાર શાંતિ, આહાર, આરામ અને રોજિંદી આદતો બનાવે છે, જેથી બાળકની વૃદ્ધિ સ્વસ્થ પાયા પર શરૂ થાય."
        ),
      },
      {
        title: t("Parenting Sanskruti", "પેરેન્ટિંગ સંસ્કૃતિ"),
        subtitle: t("પેરેન્ટિંગ સંસ્કૃતિ", "Parenting Sanskruti"),
        body: t(
          "From a young age, children learn habits at home. This plan helps build food, sleep, play, and routine habits so growth stays strong.",
          "નાનપણથી બાળકો ઘરે આદતો શીખે છે. આ પ્લાન આહાર, ઊંઘ, રમત અને રૂટિનની આદતો બનાવે છે, જેથી વૃદ્ધિ સારી રહે."
        ),
      },
      {
        title: t("Lifestyle assessment", "જીવનશૈલી મૂલ્યાંકન"),
        subtitle: t("જીવનશૈલી મૂલ્યાંકન", "Lifestyle assessment"),
        body: t(
          "A review of diet, sleep, stress, and daily habits so your doctor can plan care more clearly.",
          "આહાર, ઊંઘ, તણાવ અને રોજિંદી આદતોની સમીક્ષા — ડૉક્ટર તમારી સારવાર વધુ સારી રીતે આયોજિત કરી શકે."
        ),
      },
      {
        title: t("Weekly follow-up", "સાપ્તાહિક ફોલોઅપ"),
        subtitle: t("સાપ્તાહિક ફોલોઅપ", "Weekly follow-up"),
        body: t(
          "Share progress each week. Your doctor can review your answers and advise next steps.",
          "દર અઠવાડિયે પ્રગતિ શેર કરો. ડૉક્ટર તમારા જવાબો જોઈને આગળની સલાહ આપી શકે છે."
        ),
      },
      {
        title: t("Patient app", "પેશન્ટ એપ"),
        subtitle: t("પેશન્ટ એપ", "Patient app"),
        body: t(
          "View your plan, follow content, and fill forms from home — in the JEEVANM patient app.",
          "ઘરેથી પ્લાન જુઓ, કન્ટેન્ટ અનુસરો અને ફોર્મ ભરો — JEEVANM પેશન્ટ એપમાં."
        ),
      },
    ],
    programsKicker: t("The three paths", "ત્રણ માર્ગ"),
    programsTitle: t("Habit building, not weight loss", "આદત નિર્માણ, વેઇટ લોસ નહીં"),
    programsIntro: t(
      "JEEVANM is built around better habits. Each plan has a different stage of life — but the aim is the same: improve what you do every day, and let health and growth follow.",
      "JEEVANM સારી આદતો પર બનેલું છે. દરેક પ્લાન જીવનના અલગ તબક્કા માટે છે — પણ હેતુ એક જ છે: રોજ શું કરો છો તે સુધારો, અને આરોગ્ય તથા વૃદ્ધિ તેની સાથે આવે."
    ),
    programs: [
      {
        title: t("Arogya Sanskruti", "આરોગ્ય સંસ્કૃતિ"),
        lead: t(
          "For anyone who wants to improve daily habits and build new ones. This is not a weight-loss course.",
          "રોજિંદી આદતો સુધારવા અને નવી આદતો બનાવવા માટે. આ વેઇટ લોસ કોર્સ નથી."
        ),
        points: [
          t(
            "Focus is habit change: sleep, meals, water, movement, and a steady daily routine.",
            "ધ્યાન આદત પર છે: ઊંઘ, ભોજન, પાણી, હલનચલન અને સ્થિર રોજિંદી રૂટિન."
          ),
          t(
            "Small steps each week, so a new habit can actually stay — not a crash diet.",
            "દર અઠવાડિયે નાના પગલાં, જેથી નવી આદત ટકે — ક્રેશ ડાયટ નહીં."
          ),
          t(
            "Your doctor guides the plan with videos, exercises, and written support in the app.",
            "ડૉક્ટર એપમાં વિડિયો, કસરત અને લેખિત માર્ગદર્શન સાથે પ્લાન ચલાવે છે."
          ),
          t(
            "When habits improve, energy, digestion, and overall health often improve with them.",
            "આદતો સુધરે તો ઊર્જા, પાચન અને એકંદર આરોગ્ય પણ સાથે સુધરે છે."
          ),
        ],
      },
      {
        title: t("Garbh Sanskruti", "ગર્ભ સંસ્કૃતિ"),
        lead: t(
          "Healthy habits and growth can begin before birth. The family builds a calm, nourishing daily life for the baby’s foundation.",
          "સ્વસ્થ આદતો અને વૃદ્ધિ જન્મ પહેલાંથી શરૂ થઈ શકે. પરિવાર બાળકના પાયા માટે શાંત, પોષક રોજિંદું જીવન બનાવે છે."
        ),
        points: [
          t(
            "Daily habits during pregnancy: food, rest, breathing, and a peaceful routine.",
            "ગર્ભાવસ્થા દરમિયાન રોજિંદી આદતો: આહાર, આરામ, શ્વાસ અને શાંત રૂટિન."
          ),
          t(
            "The aim is healthy growth of the baby — not only information, but lived habits at home.",
            "હેતુ બાળકની સ્વસ્થ વૃદ્ધિ છે — ફક્ત માહિતી નહીં, ઘરે જીવાતી આદતો."
          ),
          t(
            "The whole family can take part, so the home atmosphere supports the child from the start.",
            "આખો પરિવાર ભાગ લઈ શકે, જેથી ઘરનું વાતાવરણ શરૂઆતથી બાળકને સહારો આપે."
          ),
          t(
            "Week-by-week guidance in the app keeps the habit simple and regular.",
            "એપમાં અઠવાડિયા મુજબની માર્ગદર્શિકા આદતને સરળ અને નિયમિત રાખે છે."
          ),
        ],
      },
      {
        title: t("Parenting Sanskruti", "પેરેન્ટિંગ સંસ્કૃતિ"),
        lead: t(
          "From a young age, children copy the home. This plan helps build habits early, so growth stays healthy.",
          "નાનપણથી બાળકો ઘરની નકલ કરે છે. આ પ્લાન વહેલી આદતો બનાવે છે, જેથી વૃદ્ધિ સ્વસ્થ રહે."
        ),
        points: [
          t(
            "Food, sleep, play, screens, and daily routine — habits that start small and grow with the child.",
            "આહાર, ઊંઘ, રમત, સ્ક્રીન અને રોજિંદી રૂટિન — નાની આદતો જે બાળક સાથે વધે."
          ),
          t(
            "Good growth needs more than height and weight. It needs regular habits and a steady home rhythm.",
            "સારી વૃદ્ધિ ફક્ત ઊંચાઈ-વજન નથી. તેને નિયમિત આદતો અને સ્થિર ઘરની લય જોઈએ."
          ),
          t(
            "Guidance is practical: what to do each week so the child learns by living it, not by lectures.",
            "માર્ગદર્શન વ્યવહારુ છે: દર અઠવાડિયે શું કરવું, જેથી બાળક જીવીને શીખે, ભાષણથી નહીં."
          ),
          t(
            "When habits start young, they are easier to keep as the child grows.",
            "આદતો નાનપણથી શરૂ થાય તો મોટા થતાં ટકાવવી સહેલી પડે છે."
          ),
        ],
      },
    ],
    howKicker: t("How to start", "કેવી રીતે શરૂ કરવું"),
    howTitle: t("Three simple steps", "ત્રણ સરળ પગલાં"),
    steps: [
      {
        n: t("01", "૦૧"),
        title: t("Get an ID from the clinic", "ક્લિનિકથી ID મેળવો"),
        body: t(
          "Your doctor gives you a Patient ID and password. This login is only for you.",
          "તમારા ડૉક્ટર તમને Patient ID અને password આપે છે. આ લૉગિન ફક્ત તમારા માટે છે."
        ),
      },
      {
        n: t("02", "૦૨"),
        title: t("Open the patient app", "પેશન્ટ એપ ખોલો"),
        body: t(
          "Log in with your Patient ID. Your plan appears right away in the app.",
          "પેશન્ટ એપમાં Patient ID થી લોગિન કરો. તમારો પ્લાન તરત જ દેખાશે."
        ),
      },
      {
        n: t("03", "૦૩"),
        title: t("Follow your plan", "પ્લાન અનુસરો"),
        body: t(
          "Watch weekly content, complete the lifestyle form, and share progress through follow-ups.",
          "અઠવાડિયાનું કન્ટેન્ટ જુઓ, જીવનશૈલી ફોર્મ ભરો અને ફોલોઅપથી પ્રગતિ શેર કરો."
        ),
      },
    ],
    portalKicker: t("Patient app", "પેશન્ટ એપ"),
    portalTitle: t("Your plan is waiting in the app", "તમારો પ્લાન એપમાં રાહ જુએ છે"),
    portalBody: t(
      "Open the JEEVANM patient app and log in with the Patient ID and password from your doctor. This app does not replace medical advice — for urgent help, always contact your doctor.",
      "JEEVANM પેશન્ટ એપ ખોલો અને ડૉક્ટરે આપેલ Patient ID અને password થી લોગિન કરો. આ એપ તબીબી સલાહનો વિકલ્પ નથી — તાત્કાલિક મદદ માટે હંમેશા તમારા ડૉક્ટરનો સંપર્ક કરો."
    ),
    portalCtaLogin: t("Log in now", "હવે લોગિન કરો"),
    portalCtaDashboard: t("Go to dashboard", "ડેશબોર્ડ પર જાઓ"),
    footerBlurb: t(
      "Transforming Habits Into Health. JEEVANM for every person and every family.",
      "Transforming Habits Into Health. દરેક વ્યક્તિ અને દરેક પરિવાર માટે JEEVANM."
    ),
    footerLogin: t("Patient Login", "Patient Login"),
    footerTerms: t("Terms", "Terms"),
    footerPrivacy: t("Privacy", "Privacy"),
    footerClinic: t("Clinic access", "Clinic access"),
    inquiryKicker: t("Inquiry", "ઇન્ક્વાયરી"),
    inquiryTitle: t("Ask us anything", "અમને પૂછો"),
    inquiryBody: t(
      "Share your name and phone. The clinic will see your message and get back to you.",
      "તમારું નામ અને ફોન લખો. ક્લિનિકને તમારો સંદેશ મળશે અને તેઓ તમને જવાબ આપશે."
    ),
    inquiryName: t("Name", "નામ"),
    inquiryPhone: t("Phone", "ફોન"),
    inquiryEmail: t("Email", "ઈમેલ"),
    inquiryEmailOptional: t("optional", "વૈકલ્પિક"),
    inquiryInterest: t("Interested in", "રસ"),
    inquiryMessage: t("Message", "સંદેશ"),
    inquirySubmit: t("Send inquiry", "ઇન્ક્વાયરી મોકલો"),
    inquirySending: t("Sending...", "મોકલાઈ રહ્યું છે..."),
    inquirySuccess: t("Thank you. Your inquiry has been sent.", "આભાર. તમારી ઇન્ક્વાયરી મોકલાઈ ગઈ છે."),
    inquiryError: t("Could not send. Please try again.", "મોકલી શકાયું નહીં. ફરી પ્રયાસ કરો."),
    inquiryAnother: t("Send another", "બીજી મોકલો"),
    inquiryInterests: [
      { value: "", label: t("General inquiry", "સામાન્ય પૂછપરછ") },
      { value: "arogya", label: t("Arogya Sanskruti", "આરોગ્ય સંસ્કૃતિ") },
      { value: "garbha", label: t("Garbh Sanskruti", "ગર્ભ સંસ્કૃતિ") },
      { value: "parenting", label: t("Parenting Sanskruti", "પેરેન્ટિંગ સંસ્કૃતિ") },
      { value: "other", label: t("Other", "અન્ય") },
    ],
  };
}
