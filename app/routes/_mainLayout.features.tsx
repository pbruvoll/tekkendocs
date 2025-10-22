import { ContentContainer } from '~/components/ContentContainer';

export default function Features() {
  return (
    <ContentContainer enableBottomPadding enableTopPadding>
      <div className="prose prose-invert">
        <h1>Tekkendocs features</h1>

        <h2>Frame data</h2>
        <p>
          The site contains frame data for all tekken 7 characters. We are in
          the process of adding frame data for Tekken 8.
        </p>

        <h2>Data in google sheets</h2>
        <p>
          The data is stored in google sheets. This acts as the "source of
          truth" for both tekkendocs and{' '}
          <a href="http://rbnorway.org">rbnorway.org</a>. This makes it easy to
          work together on the data. Everyone can view and comment on the
          sheets. If you want to contribute, it is also possible to get edit
          access. To view the sheets, click on the "edit" icon in the top right
          on the site.
        </p>

        <h2>Command pages and deep linking</h2>
        <p>
          Each command has its own page. You just add the character and the
          command to the url, e.g https://tekkendocs.com/bryan/b1. This also
          generates a preview link with the data for the move. If you paste this
          link in discord, you will see the data similar to how you see it from
          a tekken-bot. This also means moves can be "googled". If you google
          "tekkendocs nina df1", you should see the frame data in the google
          preview even without accessing the site. This will hopefully work for
          most moves when the site gets more traffic.
        </p>

        <h2>Open for sharing</h2>
        <p>
          Sharing is caring. If you have an awesome idea for how to use the
          data, you can do so. All we hope for is that you give credits to the
          site the same place where the data is shown. You can copy data from
          the google sheets. But even better, you can also get the data in json
          format which makes it easier to work with. Data is exposed at their
          own url, e.g. https://tekkendocs.com/api/t7/jin/framedata
        </p>

        <h2>Cheat Sheets</h2>
        <p>
          Thanks to the datagathering done by Applay, each character has a page
          with a quick overview. This page contains key moves, punishers,
          comboes and so on. E.g. https://tekkendocs.com/asuka/meta
        </p>

        <h2>Community</h2>
        <p>
          There is a discord server for the site. Click the discord logo in the
          header to join. The source code of the site is available at GitHub and
          we are open for contributions. Click the GitHub logo in the header.
        </p>

        <h2>Flexibility</h2>
        <p>
          The site is built from scratch. So the only limitations for new
          features are imagination and effort.
        </p>

        <h2>Free</h2>
        <p>
          There are no ads or tracking cookies. The goal is not to make money,
          but to create a useful site for the community.
        </p>

        <p>
          I know there are other sites out there which will provide Tekken 8
          frame data. Wavu wiki and geppopotamus look very nice. But all sites
          have their strengths and weaknesses. I hope to build an awesome site
          that will complement what is already out there. Please get in touch if
          you want to contribute :)
        </p>
      </div>
    </ContentContainer>
  );
}
