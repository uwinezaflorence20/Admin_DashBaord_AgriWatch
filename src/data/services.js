import {
  TbScale,
  TbFileText,
  TbBuildingCommunity,
  TbHomeDollar,
  TbUsers,
  TbFileCertificate,
 
} from 'react-icons/tb';

export const services = [
  {
    id: 'legal-advisory-litigation',
    icon: TbScale,

    title: {
      en: 'Legal Advisory & Litigation',
      rw: 'Inama z’Amategeko n’Imiburanishirize y’Imanza'
    },

    desc: {
      en: 'Core legal advisory and litigation services for individuals, businesses, and institutions.',
      rw: 'Serivisi z’ibanze z’inama z’amategeko no kuburanira abakiliya mu nkiko.'
    },

    fullDesc: {
      en: 'We provide comprehensive legal representation and advisory services across a wide range of legal matters, including civil, commercial, labor, family, and administrative law. Our firm assists clients in resolving disputes, handling complex legal issues, and representing them before courts, tribunals, and administrative bodies. We are committed to protecting our clients’ rights and delivering strong legal advocacy at every stage of the process..',

      rw: 'Iyi ni yo serivisi y’ibanze y’inama z’amategeko no kuburanira abakiliya. Dufasha abakiliya mu bibazo by’imbonezamubano birimo amasezerano n’inshingano, amakimbirane y’ubucuruzi n’amasosiyete, ibibazo by’umurimo, ibibazo by’umuryango nko gatanya, kurera abana n’izungura, ndetse n’ibibazo by’ubuyobozi. Tunahagararira abakiliya imbere y’inkiko n’izindi nzego z’ubuyobozi tugaharanira ko uburenganzira bwabo burindwa mu buryo bwuzuye.'
    },

    servicesIncluded: [
      { en: 'Civil law matters (contracts, obligations, disputes)', rw: 'Ibibazo by’imbonezamubano (amasezerano, inshingano)' },
      { en: 'Commercial and corporate disputes', rw: 'Amakimbirane y’ubucuruzi n’amasosiyete' },
      { en: 'Labor and employment disputes', rw: 'Amakimbirane y’umurimo' },
      { en: 'Family law (divorce, custody, succession)', rw: 'Amategeko y’umuryango (gatanya, kurera abana, izungura)' },
      { en: 'Administrative and regulatory matters', rw: 'Ibibazo by’ubuyobozi n’amabwiriza ya leta' },
      { en: 'Court and tribunal representation', rw: 'Kuhagararira imbere y’inkiko n’izindi nzego' }
    ]
  },

  {
    id: 'contract-commercial-law',
    icon: TbFileText,

    title: {
      en: 'Contract & Commercial Law',
      rw: 'Amategeko y’Amasezerano n’Ubucuruzi'
    },

    desc: {
      en: 'Drafting, reviewing, and managing legally binding agreements.',
      rw: 'Gutegura no gusuzuma amasezerano yubahirije amategeko.'
    },

    fullDesc: {
      en: 'We provide professional legal services in all aspects of contracts and commercial agreements. Our firm assists clients in drafting clear and legally enforceable contracts, reviewing and interpreting contractual terms, negotiating agreements between parties, and ensuring full legal compliance. We help businesses and individuals avoid legal risks by ensuring that every agreement is properly structured and protects their interests.',

      rw: 'Dutanga serivisi z’umwuga mu bijyanye n’amasezerano n’ubucuruzi. Dufasha abakiliya gutegura amasezerano asobanutse kandi yubahirije amategeko, kuyasuzuma, kuyasobanura no kuganira ku mabwiriza yayo. Dufasha ibigo n’abantu ku giti cyabo kwirinda ingaruka z’amategeko binyuze mu masezerano ateguye neza.'
    },

    servicesIncluded: [
      { en: 'Contract drafting', rw: 'Gutegura amasezerano' },
      { en: 'Contract review and interpretation', rw: 'Gusuzuma no gusobanura amasezerano' },
      { en: 'Negotiation of agreements', rw: 'Kuganira ku masezerano' },
      { en: 'Legal compliance in contracts', rw: 'Kubahiriza amategeko mu masezerano' }
    ]
  },

  {
  id: 'notary-services',
  icon: TbFileCertificate,

  title: {
    en: 'Notary Services',
    rw: 'Serivisi za Noteri'
  },

  desc: {
    en: 'Professional notarization and authentication services for legal documents and agreements.',
    rw: 'Serivisi zo kwemeza no guhamya inyandiko n’amasezerano byemewe n’amategeko.'
  },

  fullDesc: {
    en: 'We provide professional notary services for individuals, businesses, and organizations, including document authentication, certification, signature witnessing, and legalization of legal documents. Our firm ensures that all documents are properly prepared, legally valid, and compliant with applicable legal requirements while maintaining professionalism, accuracy, and confidentiality.',

    rw: 'Dutanga serivisi za noteri ku bantu ku giti cyabo, ibigo ndetse n’imiryango, zirimo kwemeza inyandiko, guhamya imikono no gutunganya inyandiko z’amategeko. Sosiyete yacu yemeza ko inyandiko zose zitegurwa neza, zemerwa n’amategeko kandi zikurikiza ibisabwa n’amategeko, hubahirizwa ubunyamwuga, ukuri n’ibanga.'
  },

  servicesIncluded: [
    { en: 'Document authentication and certification', rw: 'Kwemeza no guhamya inyandiko' },
    { en: 'Signature witnessing', rw: 'Guhamya imikono' },
    { en: 'Affidavits and sworn declarations', rw: 'Indahiro n’inyandiko zemejwe' },
    { en: 'Power of attorney documents', rw: 'Inyandiko z’ububasha bwo guhagararira abandi' },
    { en: 'Certified copies of legal documents', rw: 'Kopi z’inyandiko zemejwe' },
    { en: 'Legalization of official documents', rw: 'Gutunganya inyandiko zemewe n’amategeko' }
  ]
},

  {
    id: 'corporate-business-law',
    icon: TbBuildingCommunity,

    title: {
      en: 'Corporate & Business Law',
      rw: 'Amategeko y’Amasosiyete n’Ubucuruzi'
    },

    desc: {
      en: 'Legal support for business formation and corporate governance.',
      rw: 'Ubufasha mu kwandikisha no gucunga ibigo by’ubucuruzi.'
    },

    fullDesc: {
      en: 'We assist businesses with full corporate legal services including company formation, structuring, governance advisory, regulatory compliance, legal audits, and due diligence. Our goal is to ensure that businesses operate legally, efficiently, and in full compliance with applicable laws while minimizing risks.',

      rw: 'Dufasha ibigo mu kwandikisha amasosiyete, kubaka imiterere y’ubucuruzi, gutanga inama ku micungire y’ibigo, kubahiriza amategeko, gukora igenzura n’isuzuma ry’amategeko. Intego yacu ni ugufasha ibigo gukora mu buryo bwemewe n’amategeko kandi burambye.'
    },

    servicesIncluded: [
      { en: 'Company registration and structuring', rw: 'Kwandikisha no gutunganya isosiyete' },
      { en: 'Corporate governance advisory', rw: 'Inama ku micungire y’ibigo' },
      { en: 'Regulatory compliance', rw: 'Kubahiriza amategeko' },
      { en: 'Legal audits & due diligence', rw: 'Igenzura n’isuzuma ry’amategeko' }
    ]
  },

  {
    id: 'property-real-estate-law',
    icon: TbHomeDollar,

    title: {
      en: 'Property & Real Estate Law',
      rw: 'Amategeko y’Umutungo n’Ubutaka'
    },

    desc: {
      en: 'Legal assistance in property transactions and land disputes.',
      rw: 'Ubufasha mu bibazo by’umutungo n’ubutaka.'
    },

    fullDesc: {
      en: 'We provide legal assistance in all matters relating to property and real estate. This includes property transactions, land disputes, lease agreements, property management issues, title verification, and due diligence. Our firm ensures that all property dealings are legally secure and fully compliant with applicable laws.',

      rw: 'Dufasha abakiliya mu bibazo byose byerekeye umutungo n’ubutaka. Harimo kugura no kugurisha umutungo, gukemura amakimbirane y’ubutaka, amasezerano y’ubukode, imicungire y’umutungo, kugenzura ibyangombwa byawo ndetse no kubahiriza amategeko.'
    },

    servicesIncluded: [
      { en: 'Property transactions and conveyancing', rw: 'Ihererekanya ry’umutungo' },
      { en: 'Land dispute resolution', rw: 'Gukemura amakimbirane y’ubutaka' },
      { en: 'Lease agreements', rw: 'Amasezerano y’ubukode' },
      { en: 'Title verification & due diligence', rw: 'Kugenzura ibyangombwa by’umutungo' }
    ]
  },

  {
    id: 'adr-mediation',
    icon: TbUsers,

    title: {
      en: 'Alternative Dispute Resolution (ADR)',
      rw: 'Gukemura Amakimbirane mu Bwumvikane'
    },

    desc: {
      en: 'Resolving disputes peacefully outside court through mediation.',
      rw: 'Gukemura amakimbirane mu bwumvikane hatabayeho inkiko.'
    },

    fullDesc: {
      en: 'We offer alternative dispute resolution services aimed at resolving conflicts outside the courtroom. Through mediation and negotiation, we help parties reach amicable, confidential, and cost-effective solutions. Our ADR services cover civil, commercial, labor, and family disputes, promoting peaceful and efficient resolution of conflicts.',

      rw: 'Dutanga serivisi z’ubuhuza zigamije gukemura amakimbirane hatabayeho kujya mu nkiko. Dufasha impande zifitanye amakimbirane kugera ku bwumvikane mu ibanga kandi buhendutse, mu bibazo by’imbonezamubano, ubucuruzi, umurimo n’umuryango.'
    },

    servicesIncluded: [
      { en: 'Mediation services', rw: 'Serivisi z’ubuhuza' },
      { en: 'Amicable settlements', rw: 'Gushaka ibisubizo byumvikanyweho' },
      { en: 'Conflict resolution', rw: 'Gukemura amakimbirane' },
      { en: 'Negotiation support', rw: 'Ubufasha mu biganiro' }
    ]
  }
];