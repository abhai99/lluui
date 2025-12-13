import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, ArrowLeft } from 'lucide-react';
import { defaultPages } from '@/lib/defaultContent';

const ContentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState<string | null>(null);
    const [title, setTitle] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // 1. Try fetching from Firestore
                const docRef = doc(db, 'content', 'pages');
                const docSnap = await getDoc(docRef);
                let foundContent = null;
                let foundTitle = null;

                if (docSnap.exists() && id) {
                    const data = docSnap.data();
                    const pageKey = `page${id}`;
                    if (data[pageKey]) {
                        foundContent = data[pageKey].content;
                        foundTitle = data[pageKey].title;
                    }
                }

                // 2. Fallback to Default Content if not in Firestore
                if (!foundContent && id) {
                    const pageKey = `page${id}`; // e.g. "page1"
                    // Use type assertion to access the object securely
                    const defaultPage = defaultPages[pageKey as keyof typeof defaultPages];
                    if (defaultPage) {
                        foundContent = defaultPage.content;
                        foundTitle = defaultPage.title;
                        console.log(`Loaded default content for ${pageKey}`);
                    }
                }

                if (foundContent) {
                    setContent(foundContent);
                    setTitle(foundTitle);
                }

            } catch (error) {
                console.error("Error fetching content:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [id]);

    // Execute scripts found in the content
    useEffect(() => {
        if (!content) return;

        // Find the container
        const container = document.getElementById('content-container');
        if (!container) return;

        // Find all script tags
        const scripts = container.getElementsByTagName('script');

        Array.from(scripts).forEach(script => {
            const newScript = document.createElement('script');
            Array.from(script.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });

            if (script.innerHTML) {
                newScript.innerHTML = script.innerHTML;
            } else if (script.src) {
                newScript.src = script.src;
            }

            // Execute
            script.parentNode?.replaceChild(newScript, script);
        });
    }, [content]);

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
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Minimal Sticky Header for App feel */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 px-4 h-14 flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="-ml-2 hover:bg-white/10 rounded-full h-10 w-10">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="font-semibold text-lg truncate flex-1">{title || 'Content'}</h1>
            </div>

            {/* Full Width Content Area */}
            <div className="flex-1 w-full max-w-md mx-auto md:max-w-4xl"> {/* Centered on desktop, full on mobile */}
                <div className="w-full h-full p-2 md:p-6">
                    <div
                        id="content-container"
                        className="prose prose-invert prose-lg max-w-none w-full
                                   [&>div]:w-full [&>div]:max-w-none [&_iframe]:w-full [&_iframe]:aspect-video"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ContentPage;
