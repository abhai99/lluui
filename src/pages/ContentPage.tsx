import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, ArrowLeft } from 'lucide-react';

const ContentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const docRef = doc(db, 'content', 'pages');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists() && id) {
                    const data = docSnap.data();
                    const pageKey = `page${id}`;
                    if (data[pageKey]) {
                        setContent(data[pageKey].content);
                    }
                }
            } catch (error) {
                console.error("Error fetching content:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen gradient-hero flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!content) {
        return (
            <div className="min-h-screen gradient-hero pt-32 px-4 text-center">
                <Navbar />
                <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
                <Button onClick={() => navigate('/')}>Go Home</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen gradient-hero">
            <Navbar /> {/* Existing Navbar handles mobile menu */}

            <div className="pt-24 px-4 pb-12 w-full max-w-7xl mx-auto">
                <Button variant="ghost" onClick={() => navigate('/')} className="mb-6 flex items-center gap-2 hover:bg-white/10">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Home
                </Button>

                {/* Render HTML Content Securely */}
                <div className="w-full bg-card/50 backdrop-blur-md p-6 md:p-10 rounded-3xl shadow-2xl border border-white/10">
                    <div
                        className="prose prose-invert prose-lg max-w-none w-full"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ContentPage;
