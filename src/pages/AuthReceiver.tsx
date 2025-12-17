import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AuthReceiver = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Verifying token...');

    useEffect(() => {
        const processToken = async () => {
            const token = searchParams.get('token');
            const error = searchParams.get('error');

            if (error) {
                setStatus('Login failed from app.');
                toast.error(`App Login Error: ${error}`);
                setTimeout(() => navigate('/'), 3000);
                return;
            }

            if (!token) {
                setStatus('No token received.');
                return;
            }

            try {
                setStatus('Signing in...');
                const credential = GoogleAuthProvider.credential(token); // ID Token
                await signInWithCredential(auth, credential);

                toast.success('Successfully logged in via App!');
                navigate('/'); // Go to home or previous page
            } catch (err: any) {
                console.error("AuthReceiver Error:", err);
                setStatus('Authentication failed.');
                toast.error(`Login Failed: ${err.message}`);
                setTimeout(() => navigate('/'), 3000);
            }
        };

        processToken();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-card shadow-lg border border-border">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">{status}</p>
            </div>
        </div>
    );
};

export default AuthReceiver;
