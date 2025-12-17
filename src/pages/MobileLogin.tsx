import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const MobileLogin = () => {
    useEffect(() => {
        // Trigger the Native App Login Block
        window.location.href = "myapp://native-login";
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-gray-500 font-medium">Starting Login...</p>
            </div>
        </div>
    );
};

export default MobileLogin;
