import About from '../../components/About';
import Experience from '../../components/Experience';
import Footer from '../../components/Footer';
import NavBar from '../../components/NavBar';
import Projects from '../../components/Projects';

const Home = () => {
  return (
    <div className='flex flex-col gap-5 px-5'>
      <NavBar />
      <About />
      <Experience />
      <Projects />
      <Footer />
    </div>
  );
};

export default Home;
