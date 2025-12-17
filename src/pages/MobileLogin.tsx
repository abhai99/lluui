import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { signInWithGoogle } from '@/lib/firebase';

const MobileLogin = () => {
    useEffect(() => {
        const initLogin = async () => {
            // Trigger the Redirect Login immediately on mount
            await signInWithGoogle();
        };
        initLogin();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-gray-500 font-medium">Redirecting to Google...</p>
            </div>
        </div>
    );
};

export default MobileLogin;
