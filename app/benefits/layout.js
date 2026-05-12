import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

export default function PagesLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
