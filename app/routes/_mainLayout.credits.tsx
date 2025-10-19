import { ContentContainer } from '~/components/ContentContainer';

export default function Credits() {
  return (
    <ContentContainer
      className="prose prose-invert"
      enableBottomPadding
      enableTopPadding
    >
      <h1>Credits</h1>
      <h2>Tekken 8</h2>
      <h3>Frame data source</h3>
      <p>
        {' '}
        We are working on adding frame data for tekken 8. Currently the frame
        data is imported from <a href="https://wavu.wiki/">wavu.wiki</a>.
      </p>
      <h3>Main programmer</h3>
      <p>MadCow</p>
      <hr />
      <h2>Tekken 7</h2>
      <h3>Framedata source</h3>
      This app uses the RBN frame data which is also found at{' '}
      <a href="http://rbnorway.org/t7-frame-data/">rbnorway.org</a>. That data
      was originally a translation of a japanese site called inatekken. After
      season 1 of tekken 7, that site went offline. We continued to update the
      data, using multiple sources. This includes manually testing, comments
      from the community at{' '}
      <a href="http://rbnorway.org/t7-frame-data/">rbnorway.org</a>, the
      official patch notes for each season, in game frame data and also using
      the site{' '}
      <a href="http://geppopotamus.info/game/tekken7fr">geppoppotmus.info</a> as
      a cross reference.
      <h3>Main programmer and frame translator</h3>
      <p>MadCow</p>
      <h3>Guide data source</h3>A big thanks to Applay for letting us use the
      data from his{' '}
      <a href="https://docs.google.com/spreadsheets/d/11ETDnPJuku2ref3PzODMpZ4y7e5_wfILR2aPv83WpSw/edit?usp=sharing">
        Tekken 7 cheat sheet
      </a>
      . See the readme in the link for all members who have contributed.
      <h3>Frame data update helpers</h3>
      <h4>Season 4</h4>
      <p>Bager, Mollatt, The Last Phoenix, Seik, JBoy and Kokkos</p>
      <h4>Season 3</h4>
      <p>
        Seik, Bager, Mollatt, LastPheonix, DopeShoe, JBoy, Deku, Mode and Knekk
      </p>
    </ContentContainer>
  );
}
