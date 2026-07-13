import type { PatientLocale } from "@/lib/patient-locale";
import { pickLocale } from "@/lib/patient-locale";

const SECTION_TITLES_GU: Record<string, string> = {
  "Physical Activity": "શારીરિક પ્રવૃત્તિ",
  "BMI & Weight": "BMI અને વજન",
  Sleep: "ઊંઘ",
  "Stress Assessment Questionnaire (Last One Month)":
    "તણાવ માપવા માટેની પ્રશ્નાવલી (છેલ્લા એક મહિના)",
  "Stress Assessment (Last 2 Weeks)": "તણાવ મૂલ્યાંકન (છેલ્લા ૨ અઠવાડિયા)",
  Diet: "આહાર",
  Habits: "આદતો",
  "Medical History": "વૈદકીય ઇતિહાસ",
  "Family History": "પારિવારિક ઇતિહાસ",
  "Partner Lifestyle": "જીવનસાથીની જીવનશૈલી",
};

const FIELD_LABELS_GU: Record<string, string> = {
  "Exercise Frequency": "વ્યાયામની વારંવારતા",
  "Exercise Duration": "વ્યાયામનો સમય",
  "Exercise Type": "વ્યાયામનો પ્રકાર",
  "Height (cm)": "ઊંચાઈ (સે.મી.)",
  "Weight (kg)": "વજન (કિ.ગ્રા.)",
  BMI: "BMI",
  "Sleep Hours": "ઊંઘના કલાક",
  "Sleep Quality": "ઊંઘની ગુણવત્તા",
  "Night Shift": "રાત્રિ શિફ્ટ",
  "Diet Type": "આહારનો પ્રકાર",
  Breakfast: "નાસ્તો",
  "Outside Food": "બહારનું ખાનું",
  "Water Intake (glasses)": "પાણીનું સેવન (ગ્લાસ)",
  "Tea/Coffee": "ચા/કોફી",
  "Cold Drinks": "કોલ્ડ ડ્રિંક્સ",
  "Sugar Items (Ice Cream, etc.)": "શુગર આઇટમ્સ (આઇસ ક્રીમ વગેરે)",
  "Known Conditions": "જાણીતી સ્થિતિઓ",
  "Irregular Menses": "અનિયમિત માસિક",
  Supplements: "સપ્લિમેન્ટ્સ",
  Mother: "માતા",
  Father: "પિતા",
  Smoking: "ધૂમ્રપાન",
  Alcohol: "આલ્કોહોલ",
  Exercise: "વ્યાયામ",
};

const OPTIONS_GU: Record<string, string> = {
  Never: "ક્યારેય નહીં",
  "1-2 Days/Week": "સપ્તાહે ૧-૨ દિવસ",
  "3-5 Days/Week": "સપ્તાહે ૩-૫ દિવસ",
  Daily: "રોજ",
  "<15 min": "<૧૫ મિનિટ",
  "15-30 min": "૧૫-૩૦ મિનિટ",
  "30-60 min": "૩૦-૬૦ મિનિટ",
  ">60 min": ">૬૦ મિનિટ",
  Walking: "વોકિંગ",
  Yoga: "યોગ",
  Gym: "જિમ",
  Running: "રનિંગ",
  Cycling: "સાયકલિંગ",
  Swimming: "સ્વિમિંગ",
  Other: "અન્ય",
  "<5": "<૫",
  "5-6": "૫-૬",
  "6-7": "૬-૭",
  "7-8": "૭-૮",
  ">8": ">૮",
  Poor: "ખરાબ",
  Fair: "સાધારણ",
  Good: "સારી",
  Excellent: "ઉત્તમ",
  Yes: "હા",
  No: "ના",
  Vegetarian: "શાકાહારી",
  Eggetarian: "એગેટેરિયન",
  Vegan: "વેગન",
  "Sometimes Skip": "ક્યારેક છોડું",
  "Always Skip": "હંમેશા છોડું",
  Weekly: "સાપ્તાહિક",
  "2-3 Times/Week": "સપ્તાહે ૨-૩ વાર",
  Occasionally: "ક્યારેક",
  None: "કોઈ નહીં",
  "1 Cup": "૧ કપ",
  "2 Cups": "૨ કપ",
  "3+ Cups": "૩+ કપ",
  "< 5 glasses": "< ૫ ગ્લાસ",
  "5-10 glasses": "૫-૧૦ ગ્લાસ",
  "10-15 glasses": "૧૦-૧૫ ગ્લાસ",
  "15-20 glasses": "૧૫-૨૦ ગ્લાસ",
  "> 20 glasses": "> ૨૦ ગ્લાસ",
  PCOD: "PCOD",
  Thyroid: "થાઇરોઇડ",
  Diabetes: "ડાયાબિટીસ",
  Endometriosis: "એન્ડોમેટ્રિયોસિસ",
  Hypertension: "હાયપરટેન્શન",
  Fibroids: "ફાઇબ્રોઇડ્સ",
  Heavy: "ભારે",
  Painful: "પીડાદાયક",
  "Folic Acid": "ફોલિક એસિડ",
  "Vitamin D": "વિટામિન D",
  Iron: "આયર્ન",
  Calcium: "કેલ્શિયમ",
  "Vit B12": "વિટ B12",
  BP: "બી.પી.",
  Regular: "નિયમિત",
  Occasional: "ક્યારેક",
};

export function lifestyleSectionTitle(locale: PatientLocale, title: string) {
  if (locale === "en") return title;
  return SECTION_TITLES_GU[title] ?? title;
}

export function lifestyleFieldLabel(locale: PatientLocale, label: string) {
  if (locale === "en") return label;
  return FIELD_LABELS_GU[label] ?? label;
}

export function lifestyleOptionLabel(locale: PatientLocale, option: string) {
  if (locale === "en") return option;
  return OPTIONS_GU[option] ?? option;
}

export function lifestyleFormUi(locale: PatientLocale) {
  return {
    title: pickLocale(locale, "Lifestyle Assessment", "જીવનશૈલી મૂલ્યાંકન"),
    subtitle: pickLocale(
      locale,
      "Complete all 9 sections. All fields are mandatory.",
      "બધા ૯ વિભાગ પૂર્ણ કરો. બધા પ્રશ્ન ફરજિયાત છે."
    ),
    patientName: pickLocale(locale, "Patient Name", "દર્દીનું નામ"),
    question: pickLocale(locale, "Question", "પ્રશ્ન"),
    options: pickLocale(locale, "Options", "વિકલ્પો"),
    bmiAuto: pickLocale(
      locale,
      "Auto calculated after height & weight",
      "ઊંચાઈ અને વજન પછી આપમેળે ગણાશે"
    ),
    glassNote: pickLocale(locale, "1 glass ≈ 250 ml", "૧ ગ્લાસ ≈ ૨૫૦ મિ.લી."),
    submit: pickLocale(locale, "Submit Assessment", "મૂલ્યાંકન સબમિટ કરો"),
    submitting: pickLocale(locale, "Submitting...", "સબમિટ થઈ રહ્યું છે..."),
    thankYou: pickLocale(locale, "Thank you!", "આભાર!"),
    thankYouBody: pickLocale(
      locale,
      "Your lifestyle assessment has been submitted successfully.",
      "તમારું જીવનશૈલી મૂલ્યાંકન સફળતાપૂર્વક સબમિટ થયું."
    ),
    thankYouDoctor: pickLocale(
      locale,
      "Your doctor will review it shortly.",
      "તમારા ડૉક્ટર ટૂંક સમયમાં તેની સમીક્ષા કરશે."
    ),
    loading: pickLocale(locale, "Loading...", "લોડ થઈ રહ્યું છે..."),
    loadError: pickLocale(locale, "Could not load assessment", "મૂલ્યાંકન લોડ થઈ શક્યું નહીં"),
    submitError: pickLocale(locale, "Could not submit assessment", "મૂલ્યાંકન સબમિટ થઈ શક્યું નહીં"),
  };
}
