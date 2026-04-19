import React from 'react';
import { Card, Button, Input } from '../components/UI';
import { EyeOff, Mail, Lock } from 'lucide-react';

export const Login = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="min-h-screen bg-[#0F0F11] flex items-center justify-center p-4">
      <div className="w-full max-w-[1000px] aspect-[16/9] bg-white rounded-[40px] overflow-hidden shadow-2xl flex">
        {/* Left Side - Image/Theme */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80" 
            className="absolute inset-0 w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          <div className="absolute top-12 left-12 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                <div className="w-5 h-5 border-4 border-orange-500 rounded-full" />
             </div>
             <span className="text-3xl font-black text-white">Orbit</span>
          </div>
          
          <div className="absolute bottom-12 left-12 right-12 z-10">
             <div className="bg-black/50 backdrop-blur-xl border border-white/20 p-8 rounded-[32px]">
                <h3 className="text-2xl font-bold text-white mb-2 italic">"The future of learning is circular."</h3>
                <p className="text-white/60 text-sm">Join thousands of students enhancing their research and grades with Orbit AI.</p>
             </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-[45%] p-16 flex flex-col justify-center bg-white text-gray-900">
          <h1 className="text-4xl font-black text-center mb-12 tracking-tight">Sign in to Orbit</h1>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Email</label>
              <div className="relative">
                <Input 
                  placeholder="Your email address" 
                  className="bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-400 h-14 rounded-2xl pl-12"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Password</label>
              <div className="relative">
                <Input 
                  type="password"
                  placeholder="Your password" 
                  className="bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-400 h-14 rounded-2xl pl-12 pr-12"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <EyeOff className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer" />
              </div>
              <div className="text-right">
                 <button className="text-sm font-bold text-gray-500 hover:text-orange-500 transition-colors">Forgot password?</button>
              </div>
            </div>

            <Button onClick={onLogin} className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-orange-500/20 active:scale-95 transition-transform">
              Sign In
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                <span className="bg-white px-4 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="h-14 border border-gray-100 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors font-bold text-sm">
                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-6 h-6" />
                Google
              </button>
              <button className="h-14 border border-gray-100 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors font-bold text-sm">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="w-5 h-5" />
                Apple
              </button>
            </div>

            <p className="text-center text-sm font-medium text-gray-400 mt-8">
              Don't have an account? <button className="text-gray-900 font-bold hover:text-orange-500 transition-colors">Sign up</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
