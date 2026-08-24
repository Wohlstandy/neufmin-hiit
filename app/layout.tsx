import type {Metadata} from 'next';
import {Anton,Space_Grotesk} from 'next/font/google';
import './globals.css';
const display=Anton({weight:'400',subsets:['latin'],variable:'--display'});
const body=Space_Grotesk({subsets:['latin'],variable:'--body'});
export const metadata:Metadata={title:'NEUFMIN — HIIT débutant',description:'12 exercices guidés : 30 secondes de travail, 15 secondes de repos.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="fr"><body className={`${display.variable} ${body.variable}`}>{children}</body></html>}
