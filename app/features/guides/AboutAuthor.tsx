import { TextWithLinks } from '~/components/TextWithLinks';
import { GuideSectionHeading } from './GuideSectionHeading';

type AboutAuthorProps = {
  sections: string[];
};
export const AboutAuthor = ({ sections }: AboutAuthorProps) => {
  return (
    <section id="about-the-author" className="my-10">
      <GuideSectionHeading title="About the Author" />
      {sections.map((section, index) => (
        <p key={index} className="my-2 mb-4 leading-relaxed">
          <TextWithLinks text={section} />
        </p>
      ))}
    </section>
  );
};
