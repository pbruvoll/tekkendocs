import { TextWithLinks } from '~/components/TextWithLinks';
import { GuideSectionHeading } from './GuideSectionHeading';

type AboutAuthorProps = {
  sections: string[];
};
export const AboutAuthor = ({ sections }: AboutAuthorProps) => {
  return (
    <section id="about-author" className="my-6 mb-10">
      <GuideSectionHeading title="About the Author" />
      {sections.map((section, index) => (
        <p key={index} className="my-2 mb-4">
          <TextWithLinks text={section} />
        </p>
      ))}
    </section>
  );
};
