import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AppSuccess = () => {
    const handleClose = () => {
        // Attempt to close the window (works for popups/some custom tabs)
        window.close();
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full animate-in fade-in zoom-in duration-300">
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 p-4 rounded-full">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Successful!</h1>
                <p className="text-gray-600 mb-8">
                    You have successfully logged in. You can now close this tab and return to the app.
                </p>

                <Button
                    onClick={handleClose}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transform transition active:scale-95"
                >
                    Return to App
                </Button>

                <p className="mt-4 text-xs text-gray-400">
                    If nothing happens, please use the browser's back button or close 'X' icon.
                </p>
            </div>
        </div>
    );
};

export default AppSuccess;
