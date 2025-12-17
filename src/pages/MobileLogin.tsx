import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const MobileLogin = () => {
    useEffect(() => {
        // Mobile App Entry Point
        // Immediately trigger the deep link to open the login flow in Chrome Custom Tab
        // The App should handle "myapp://open-login" by opening the browser to /login or similar (actually, it opens a Custom Tab to the login URL not deep link loop, wait.)

        // Wait, user instructions:
        // "WebView (website) -> User clicks Login -> window.location = myapp://open-login"

        // If the user visits /mobile-login directly in the WebView, we should do the same:
        window.location.href = "myapp://open-login";
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
