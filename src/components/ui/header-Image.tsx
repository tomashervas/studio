import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const HeaderImage = () => {
    const heroImage = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
  
    return (
        heroImage && (
                    <section className="mb-12 rounded-lg overflow-hidden shadow-xl relative">
                      <Image
                        src={heroImage.imageUrl}
                        alt={heroImage.description}
                        width={1200}
                        height={400}
                        className="w-full h-auto object-cover"
                        data-ai-hint={heroImage.imageHint}
                        priority
                      />
                      <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                        Foto de {heroImage.author}
                      </div>
                    </section>)
    )
}

export default HeaderImage;