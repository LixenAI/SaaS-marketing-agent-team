import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import LiveAgentChat from './LiveAgentChat';

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex min-h-[100dvh] bg-[#0A0A0F]">
      <Sidebar />
      <div className="flex-1 ml-[256px] transition-all duration-300 lg:ml-[256px]">
        <Navbar />
        <main className="min-h-[calc(100dvh-64px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: easeOutExpo }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
      <LiveAgentChat />
    </div>
  );
}
