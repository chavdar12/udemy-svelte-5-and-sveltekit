export type Experience = {
    _id: string;
    jobTitle: string;
    company: string;
    startDate: string;
    endDate?: string;
};

export type Skill = { _key: string; name: string; iconUrl?: string };

type ImageSource = { _type: 'image'; _key?: string; asset: { _ref: string } };
type TextBlock = { _type: 'block'; _key: string; style?: string; children: { text: string }[] };

export type SanityProject = {
    _id: string;
    name: string;
    company: string;
    slug: string;
    dateAccomplished: string;
    image: ImageSource;
    stack?: string[];
    content?: (TextBlock | ImageSource)[];
};

export type ContentBlock =
    | { type: 'text'; key: string; tag: 'p' | 'h2' | 'h3' | 'h4' | 'blockquote'; text: string }
    | { type: 'image'; key: string; url: string };

export type Project = Omit<SanityProject, '_id' | 'image' | 'content'> & {
    id: string;
    imageUrl: string;
    content: ContentBlock[];
};
