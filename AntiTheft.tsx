import React, { useEffect } from 'react';

const AntiTheft: React.FC = () => {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Disable F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+U / Cmd+U (View Source)
      if (cmdOrCtrl && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+S / Cmd+S (Save)
      if (cmdOrCtrl && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+P / Cmd+P (Print)
      if (cmdOrCtrl && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+C / Cmd+C (Copy)
      if (cmdOrCtrl && (e.key === 'c' || e.key === 'C')) {
        // We let the onCopy handler in individual pages handle it if needed
        // but as a global backup:
        if (window.getSelection()?.toString()) {
           e.preventDefault();
           return false;
        }
      }

      // Disable DevTools shortcuts
      if (cmdOrCtrl && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault();
        return false;
      }
      
      // Prevent PrintScreen key
      if (e.key === 'PrintScreen' || e.key === 'p' && e.altKey) {
        navigator.clipboard.writeText('');
        alert('Hành động chụp màn hình bị hạn chế để bảo vệ bản quyền nội dung.');
      }
    };

    // Detection for DevTools
    const clear = () => {
      // Some browsers allow clearing console
      console.clear();
    };

    const devtoolsProtection = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        // DevTools might be open
        clear();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', devtoolsProtection);
    
    // Prevent dragging images
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };
    
    // Anti-Debugger (Infinite loop while devtools are open)
    const antiDebugger = setInterval(() => {
      // Small trick to discourage some devtools usage
      (function() {
        // @ts-ignore
        (function a() { try { (function b(i) { if(("" + i / i).length !== 1 || i % 20 === 0) { (function(){}).constructor("debugger")() } else { debugger } b(++i) })(0) } catch(e) { setTimeout(a, 5000) } })()
      })();
    }, 5000);

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', devtoolsProtection);
    window.addEventListener('dragstart', handleDragStart);

    return () => {
      clearInterval(antiDebugger);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', devtoolsProtection);
      window.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return null;
};

export default AntiTheft;
