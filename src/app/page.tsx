import About from '../../components/About';
import Experience from '../../components/Experience';
import Projects from '../../components/Projects';

const Home = () => {
  return (
    <div className='flex flex-col gap-5'>
      <About />
      <Experience />
      <Projects />
    </div>
  );
};

export default Home;
