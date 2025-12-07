export type Contact = {
  emails: string[];
  phones: string[];
  links: string[];
};

export type Experience = {
  title: string;
  organization: string;
  period: string;
  details: string;
};

export type Education = {
  degree: string;
  institution: string;
  year: string;
  details: string;
};

export type Profile = {
  name: string;
  contact: Contact;
  location: {
    city: string;
    country: string;
  };
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  research?: string;
};

export type SectionId =
  | "basic"
  | "education"
  | "skills"
  | "experience"
  | "research"
  | "summary";
