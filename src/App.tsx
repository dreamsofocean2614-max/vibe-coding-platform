/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './lib/ThemeContext';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Explore from './pages/Explore';
import StoryDetail from './pages/StoryDetail';
import ReadChapter from './pages/ReadChapter';
import AdminDashboard from './pages/admin/AdminDashboard';
import EditStory from './pages/admin/EditStory';
import EditChapter from './pages/admin/EditChapter';
import BulkAddChapters from './pages/admin/BulkAddChapters';
import LegalPage from './pages/LegalPage';

import ThemeEffect from './components/ThemeEffect';
import AntiTheft from './components/AntiTheft';
import LiveThemeEditor from './components/LiveThemeEditor';
import { Toaster } from 'react-hot-toast';

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <ThemeEffect />
      <LiveThemeEditor />
      {/* Decorative background blur elements */}
      <div className="hidden dark:block pointer-events-none fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-leaf-300/20 dark:bg-leaf-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
      <div className="hidden dark:block pointer-events-none fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#fca5a5]/20 dark:bg-leaf-400/10 blur-[150px] mix-blend-multiply dark:mix-blend-screen" />
      <div className="hidden dark:block pointer-events-none fixed top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-leaf-400/20 dark:bg-leaf-700/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
}

import Profile from './pages/Profile';
import Settings from './pages/Settings';

import UserManagement from './pages/admin/UserManagement';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin, loading } = useAuth();
  if (loading) return null;
  return isSuperAdmin ? <>{children}</> : <Navigate to="/" replace />;
}

function UploaderRoute({ children }: { children: React.ReactNode }) {
  const { isEditor, loading } = useAuth();
  if (loading) return null;
  return isEditor ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <AntiTheft />
          <Toaster position="top-center" />
          <Router>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/story/:id" element={<StoryDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                
                <Route path="/admin" element={<UploaderRoute><AdminDashboard /></UploaderRoute>} />
                <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
                <Route path="/admin/story/new" element={<UploaderRoute><EditStory /></UploaderRoute>} />
                <Route path="/admin/story/:id/edit" element={<UploaderRoute><EditStory /></UploaderRoute>} />
                <Route path="/admin/story/:storyId/chapter/new" element={<UploaderRoute><EditChapter /></UploaderRoute>} />
                <Route path="/admin/story/:storyId/chapter/bulk" element={<UploaderRoute><BulkAddChapters /></UploaderRoute>} />
                <Route path="/admin/story/:storyId/chapter/:chapterId/edit" element={<UploaderRoute><EditChapter /></UploaderRoute>} />
                <Route path="/legal/:slug" element={<LegalPage />} />
              </Route>
              <Route path="/story/:id/read/:chapterNum" element={<ReadChapter />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
