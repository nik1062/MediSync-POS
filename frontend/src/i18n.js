import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        find_clinic: "Find Clinic",
        my_consultations: "My Consultations",
        pos_dashboard: "POS Dashboard",
        logout: "Logout",
        login: "Login"
      },
      booking: {
        triage_title: "How urgent is this visit?",
        routine: "Routine",
        routine_desc: "Regular checkups, minor symptoms",
        urgent: "Urgent",
        urgent_desc: "Needs attention today",
        emergency: "Emergency",
        emergency_desc: "Severe pain, bleeding, difficulty breathing",
        book_slot: "Book Slot",
        cancel: "Cancel"
      },
      prescription: {
        receipt: "Prescription Receipt",
        diagnosis: "Diagnosis",
        treatment: "Treatment Course",
        download_pdf: "Download PDF",
        clinical_warning: "Note: Clinical terminology is kept in English for medical accuracy."
      }
    }
  },
  hi: {
    translation: {
      nav: {
        find_clinic: "क्लिनिक खोजें",
        my_consultations: "मेरे परामर्श",
        pos_dashboard: "POS डैशबोर्ड",
        logout: "लॉग आउट",
        login: "लॉग इन"
      },
      booking: {
        triage_title: "यह विज़िट कितनी आवश्यक है?",
        routine: "सामान्य",
        routine_desc: "नियमित जांच, मामूली लक्षण",
        urgent: "ज़रूरी",
        urgent_desc: "आज ही ध्यान देने की आवश्यकता है",
        emergency: "आपातकालीन",
        emergency_desc: "तेज दर्द, खून बहना, सांस लेने में कठिनाई",
        book_slot: "स्लॉट बुक करें",
        cancel: "रद्द करें"
      },
      prescription: {
        receipt: "पर्चे की रसीद",
        diagnosis: "निदान",
        treatment: "उपचार",
        download_pdf: "पीडीएफ डाउनलोड करें",
        clinical_warning: "नोट: चिकित्सा सटीकता के लिए नैदानिक शब्दावली अंग्रेजी में रखी गई है।"
      }
    }
  },
  ta: {
    translation: {
      nav: {
        find_clinic: "கிளினிக் தேடு",
        my_consultations: "என் ஆலோசனைகள்",
        pos_dashboard: "POS டாஷ்போர்டு",
        logout: "வெளியேறு",
        login: "உள்நுழை"
      },
      booking: {
        triage_title: "இந்த சந்திப்பு எவ்வளவு அவசரமானது?",
        routine: "வழக்கமான",
        routine_desc: "வழக்கமான பரிசோதனை, சிறிய அறிகுறிகள்",
        urgent: "அவசரம்",
        urgent_desc: "இன்று கவனம் தேவை",
        emergency: "மிக அவசரம்",
        emergency_desc: "கடுமையான வலி, இரத்தப்போக்கு, மூச்சுத் திணறல்",
        book_slot: "முன்பதிவு செய்",
        cancel: "ரத்து செய்"
      },
      prescription: {
        receipt: "மருந்து சீட்டு",
        diagnosis: "நோய் கண்டறிதல்",
        treatment: "சிகிச்சை முறை",
        download_pdf: "PDF பதிவிறக்கம்",
        clinical_warning: "குறிப்பு: மருத்துவ துல்லியத்திற்காக மருத்துவ வார்த்தைகள் ஆங்கிலத்தில் உள்ளன."
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
