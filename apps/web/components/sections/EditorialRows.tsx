import { Check } from 'lucide-react';
import Reveal from '../motion/Reveal';

export type EditorialBlock = {
    title: string;
    text: string;
    items?: string[];
};

type Props = {
    blocks: EditorialBlock[];
};

export default function EditorialRows({ blocks }: Props) {
    return (
        <section className="content-blocks">
            <div className="wrap">
                {blocks.map((block, i) => (
                    <Reveal key={block.title} as="article">
                        <span>0{i + 1}</span>
                        <div>
                            <h2>{block.title}</h2>
                            <p>{block.text}</p>
                            {block.items && block.items.length > 0 && (
                                <ul>
                                    {block.items.map((item) => (
                                        <li key={item}>
                                            <Check aria-hidden="true" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}