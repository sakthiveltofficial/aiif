"use client";
import LayoutWrapper from '@/Components/Common/LayoutWrapper'
import React, { useRef } from 'react'
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import RoboSection from './RoboSection';
import Image from 'next/image';


const CardDesign = ({ data }) => {
    return (
        <div className='w-full md:max-w-[310px] h-[150px] sm:h-[300px] flex flex-col gap-2 sm:gap-[10px] p-2 sm:p-0 '>
            <p className='text-lg sm:text-xl lg:text-2xl font-medium text-[#00CA40] leading-tight'>{data.title}</p>
            <p className='text-sm sm:text-base lg:text-lg text-[#929292] leading-normal tracking-wide'>{data.description}</p>
        </div>
    )
}




const page = () => {

    const containerRef = useRef(null);
    const lightBlueRef = useRef(null);  // New light blue layer
    const cardRef = useRef(null);
    const textRef = useRef(null);
    const shadowRef = useRef(null);
    const circleRef = useRef(null);
    const diceTextRef = useRef(null);
    const diceShadowRef = useRef(null);
    const diceImageRef = useRef(null);

    // Move diceTexts and currentIndex outside useGSAP so they can be accessed in JSX
    const diceTexts = [
        {id:1,name : "Catalyst Platform", image : "/webp/startup/Catalyst Platform.webp"}, 
        {id:2,name : "MentorTN", image : "/webp/startup/MentorTN.webp"}, 
        {id:3,name : "StartupTN", image : "/webp/startup/startuptn.webp"}, 
        {id:4,name : "Coordination programs", image : "/webp/startup/program coordination.webp"},
        {id:5,name : "Startup India", image : "/webp/startup/startup.webp"},
        {id:6,name : "NITI Aayog", image : "/webp/startup/NITI-AIM-Logo.webp"},
        {id:7,name : "Atal Innovation Mission", image : "/webp/startup/image.png"},
        {id:8,name : "EDII", image : "/webp/startup/EDIA.webp"},
        {id:9,name : "MSME", image : "/webp/startup/ms&me.webp"},   
    ];
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const currentIndexRef = useRef(0); // Add ref to track current index for GSAP
    const rollIntervalRef = useRef(null); // Add ref to track the interval

    useGSAP(() => {
        const container = containerRef.current;
        const lightBlue = lightBlueRef.current;
        const card = cardRef.current;
        const text = textRef.current;
        const shadow = shadowRef.current;
        const circle = circleRef.current;
        const diceText = diceTextRef.current;
        const diceShadow = diceShadowRef.current;
        const diceImage = diceImageRef.current;

                // Check if device supports hover (not touch-only)
        const supportsHover = window.matchMedia('(hover: hover)').matches;
        
        // Get screen size for responsive animations
        const isMobile = window.innerWidth < 768; // md breakpoint
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

        if (container && lightBlue && card && text && shadow && circle && diceText && diceShadow && diceImage) {
            // Only add complex 3D animations on devices that support hover
            if (supportsHover && !isMobile) {
                // Hover animation - create layered 3D separation
                container.addEventListener('mouseenter', () => {
                    // Pause the dice animation
                    if (rollIntervalRef.current) {
                        clearInterval(rollIntervalRef.current);
                        rollIntervalRef.current = null;
                    }
                    
                    // Adjust animation intensity based on screen size
                    const intensity = isTablet ? 0.6 : 1;

                    // Tilt the entire container
                    gsap.to(container, {
                        duration: 0.8,
                        rotationX: 15 * intensity,
                        rotationY: -20 * intensity,
                        ease: "power2.out"
                    });

                    // Layer 0: Light Blue div (deepest layer - only visible on hover)
                    gsap.to(lightBlue, {
                        duration: 0.8,
                        z: -150 * intensity,
                        rotationX: 3 * intensity,
                        rotationY: -3 * intensity,
                        opacity: 0.8,
                        ease: "power2.out"
                    });

                    // Layer 1: Blue div (bottom layer)
                    gsap.to(card, {
                        duration: 0.8,
                        z: -40 * intensity,
                        rotationX: 5 * intensity,
                        rotationY: -5 * intensity,
                        ease: "power2.out"
                    });

                    // Layer 2: Text shadow (middle layer)
                    gsap.to(shadow, {
                        duration: 0.8,
                        z: -20 * intensity,
                        y: 8 * intensity,
                        x: 8 * intensity,
                        rotationX: 3 * intensity,
                        rotationY: -3 * intensity,
                        opacity: 0.6,
                        ease: "power2.out"
                    });

                    // Layer 3: Black circle (between shadow and text, behind upTN only)
                    gsap.to(circle, {
                        duration: 0.8,
                        z: -10 * intensity,
                        y: -3 * intensity,
                        rotationX: 6 * intensity,
                        rotationY: -6 * intensity,
                        scale: 1.05 + (0.05 * intensity),
                        ease: "back.out(1.7)"
                    });

                    // Layer 4: Main text (top layer)
                    gsap.to(text, {
                        duration: 0.8,
                        z: 30 * intensity,
                        y: -15 * intensity,
                        rotationX: 10 * intensity,
                        rotationY: -10 * intensity,
                        ease: "power2.out"
                    });
                });

                // Mouse leave animation - return all layers to normal
                container.addEventListener('mouseleave', () => {
                    // Resume the dice animation
                    if (!rollIntervalRef.current) {
                        rollIntervalRef.current = setInterval(rollReveal, 4000);
                    }
                    
                    gsap.to(container, {
                        duration: 0.6,
                        rotationX: 0,
                        rotationY: 0,
                        ease: "power2.out"
                    });

                    gsap.to([card, text, shadow, circle], {
                        duration: 0.6,
                        z: 0,
                        y: 0,
                        x: 0,
                        rotationX: 0,
                        rotationY: 0,
                        scale: 1,
                        opacity: 1,
                        ease: "power2.out"
                    });

                    // Light blue layer fades out completely
                    gsap.to(lightBlue, {
                        duration: 0.6,
                        z: 0,
                        rotationX: 0,
                        rotationY: 0,
                        opacity: 0,  // Hide it again
                        ease: "power2.out"
                    });
                });
            } else {
                // For touch devices, add a simple tap animation
                container.addEventListener('touchstart', () => {
                    gsap.to(container, {
                        duration: 0.2,
                        scale: 0.98,
                        ease: "power2.out"
                    });
                });

                container.addEventListener('touchend', () => {
                    gsap.to(container, {
                        duration: 0.3,
                        scale: 1,
                        ease: "back.out(1.7)"
                    });
                });
            }

            // Dice roll reveal animation

            // Set initial text and image to match the first item
            if (diceText && diceShadow && diceImage) {
                diceText.textContent = diceTexts[0].name;
                diceShadow.textContent = diceTexts[0].name;
                diceImage.src = diceTexts[0].image;
            }

            const rollReveal = () => {
                // Move current text and image up and out
                gsap.to([diceText, diceShadow, diceImage], {
                    duration: 0.5,
                    y: -50,
                    opacity: 0,
                    ease: "power2.inOut",
                    onComplete: () => {
                        // Update text content for both main text and shadow, and image
                        const newIndex = (currentIndexRef.current + 1) % diceTexts.length;
                        currentIndexRef.current = newIndex; // Update ref first
                        setCurrentIndex(newIndex); // Then update state
                        console.log(`Changing to: ${diceTexts[newIndex].name} with logo: ${diceTexts[newIndex].image}`);
                        diceText.textContent = diceTexts[newIndex].name;
                        diceShadow.textContent = diceTexts[newIndex].name;
                        diceImage.src = diceTexts[newIndex].image;
                        
                        // Reset position to below (hidden)
                        gsap.set([diceText, diceShadow, diceImage], { y: 50, opacity: 0 });
                        
                        // Slide new text and image up from below
                        gsap.to([diceText, diceShadow, diceImage], {
                            duration: 0.5,
                            y: 0,
                            opacity: 1,
                            ease: "power2.out"
                        });
                    }
                });
            };

            // Roll reveal every 4 seconds (slower animation)
            rollIntervalRef.current = setInterval(rollReveal, 4000);

            // Cleanup interval on component unmount
            return () => {
                if (rollIntervalRef.current) {
                    clearInterval(rollIntervalRef.current);
                }
            };
        }
    }, []); // Keep empty dependency array to avoid re-running GSAP setup

    // Sync the ref with state changes
    React.useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    // Add fade in/out animations for left section content
    useGSAP(() => {
        const leftSection = document.querySelector('.left-content-section');
        if (leftSection) {
            // Initial fade in
            gsap.fromTo(leftSection, 
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
            );
        }
    }, []);

    // Fade out/in animation when content changes
    useGSAP(() => {
        const leftSection = document.querySelector('.left-content-section');
        if (leftSection) {
            // Fade out current content
            gsap.to(leftSection, {
                opacity: 0,
                y: -10,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    // Fade in new content
                    gsap.to(leftSection, {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        ease: "power2.out"
                    });
                }
            });
        }
    }, [currentIndex]);

    const staticData = [
        {
            id: 1,
            title: "Catalyst Platform",
            image: "/webp/project_planning.webp",
            liData:[
                {
                    subTitle : "Visibility Boost",
                    description : "Get featured on the Catalyst platform to enhance your reach among investors, industry leaders, and the startup community."
                },
                {
                    subTitle : "Event Access",
                    description : "Participate in exclusive statewide challenges, hackathons, and networking events."
                },
                {
                    subTitle : "Investor Connect",
                    description : "Showcase your startup to angel investors, venture capitalists, and strategic partners."
                },

                {
                    subTitle : "Growth Resources",
                    description : "Access curated knowledge, mentorship, and collaboration opportunities through Catalyst’s network."
                }
            ]
        },
        {
            id: 2,
            title: "MentorTN",
           
            image: "/webp/project_planning.webp",
            liData:[
                {
                    subTitle : "Expert Mentorship",
                    description : "Connect with seasoned mentors from academia, industry, and entrepreneurship through MentorTN’s pool."
                },
                {
                    subTitle : "One-on-One Guidance",
                        description : "Receive personalised advice on scaling, fundraising, and product development."
                },
                {
                    subTitle : "Skill Enhancement",
                    description : "Get industry-specific training and leadership guidance to strengthen your business capabilities."
                },
                {
                    subTitle : "Network Expansion",
                    description : "Join a community of founders, innovators, and thought leaders who can open doors for your venture."
                }
            ]
        },
        {
            id: 3,
            title: "StartupTN",
        
            image: "/webp/project_planning.webp",
            liData:[
                {
                    subTitle : "Statewide Startup Support",
                    description : "Tap into Tamil Nadu’s official startup network to access resources, events, and funding opportunities."
                },
                {
                    subTitle : "Government Grants",
                    description : "Apply for exclusive StartupTN grants and schemes, with AIIF guiding your proposal process."
                },
                {
                    subTitle : "Market Opportunities",
                    description : "Leverage state-backed platforms to showcase your innovations to potential buyers and partners."
                },
                {
                    subTitle : "Policy & Advocacy",
                    description : "Stay informed on policies, incentives, and reforms designed to support your entrepreneurial journey."
                }
            ]
        },
        {
            id: 4,
            title: "Coordination programs",
            
            image: "/webp/project_planning.webp",
            liData:[
                {
                    subTitle : "Seamless State Coordination",
                    description : "AIIF bridges startups with state missions, ensuring your participation in capacity-building programs."
                },
                {
                    subTitle : "Pitch Opportunities",
                    description : "Take part in organised pitch days and demo events aligned with StartupTN’s vision."
                },

                {
                    subTitle : "Sector-Specific Initiatives",
                    description : "Engage with targeted programs in technology, manufacturing, services, and sustainability."
                },
                {
                    subTitle : "Resource Facilitation",
                    description : "Access technical, financial, and market resources through coordinated government channels."
                }
            ]
        },
        {
            id: 5,
            title: "Startup India",
            image: "/webp/project_planning.webp",
            liData:[
                {
                    subTitle : "National Recognition",
                    description : "Register and feature your startup on Startup India’s official platform for greater visibility."
                },
                {
                    subTitle : "Exclusive Schemes",
                    description : "Unlock benefits like tax exemptions, easier compliance, and government tenders."
                },
                {
                    subTitle : "Innovation Challenges",
                    description : "Compete in national-level hackathons and problem-solving missions."
                },
                {
                    subTitle : "Investor Outreach",
                    description : "Leverage Startup India’s network to connect with top-tier investors and accelerators."
                }
            ]

        },
        {
            id: 6,
            title: "NITI Aayog",
            image: "/webp/project_planning.webp",
            liData:[
                {
                    subTitle : "Policy Shaping",
                    description : "Engage with think-tank-driven innovation and entrepreneurship policy initiatives."
                },
                {
                    subTitle : "Flagship Programs",
                    description : "Participate in NITI Aayog’s high-impact projects and thematic challenges."
                },
                {
                    subTitle : "Research Collaboration",
                    description : "Access data, reports, and analysis to make informed business decisions."
                },
                {
                    subTitle : "Impact Opportunities",
                    description : "Be part of national transformation projects in health, education, agriculture, and sustainability."
                }
            ]
        },
        {
            id: 7,
            title: "Atal Innovation Mission",
            image: "/webp/project_planning.webp",
            liData:[
                {
                    subTitle : "Incubation Support",
                    description : "Leverage AIM’s incubation network for workspace, mentoring, and R&D facilities."
                },
                {
                    subTitle : "Grant Access",
                    description : "Apply for innovation grants and seed funding from AIM programs."
                },
                {
                    subTitle : "Student Innovation",
                    description : "Encourage young innovators through Atal Tinkering Labs and related initiatives."
                },
                {
                    subTitle : "Global Collaboration",
                    description : "Connect with international partners and programs under AIM’s global outreach."
                }
            ]
        },
        {
            id: 8,
            title: "EDII",
            image: "/webp/project_planning.webp",
            liData:[
                {
                    subTitle : "Entrepreneurship Development",
                    description : "Learn from structured training programs designed by EDII to strengthen your entrepreneurial mindset."
                },
                {
                    subTitle : "Skill Certification",
                    description : "Gain certifications recognised by industry and government to boost your credibility."
                },
                {
                    subTitle : "Sector-Specific Support",
                    description : "Access targeted programs for manufacturing, services, rural enterprises, and women entrepreneurs."
                },

                {
                    subTitle : "Funding Linkages",
                    description : "Connect with financial institutions and investors through EDII’s vast network."
                },
                {
                    subTitle : "CTA",
                    description : "Empower your entrepreneurial journey with AIIF & EDII."
                }
            ]
        },
        {
            id: 9,
            title: "MSME",
            image: "/webp/project_planning.webp",
            liData:[
                {
                    subTitle : "Business Development Schemes",
                    description : "Access subsidies, incentives, and market development assistance from MSME programs."
                },
                {
                    subTitle : "Technology Upgradation",
                    description : "Leverage government support for modernising processes and adopting advanced tools."
                },
                {
                    subTitle : "Cluster Development",
                    description : "Join sector-specific clusters for shared resources, marketing, and R&D facilities."
                },
                {
                    subTitle : "Export Opportunities",
                    description : "Get assistance for international trade fairs, buyer-seller meets, and export readiness."
                },
                {
                    subTitle : "CTA",
                    description : "Grow your MSME with AIIF’s support and MSME initiatives."
                }
            ]
        }

    ]



    return (
        <>
            <LayoutWrapper>

                <div className='font-outfit container mx-auto px-4 sm:px-6 lg:px-8 xl:px-[100px] my-8 sm:my-12 lg:my-[100px]'>

                    <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8'>

                        {/* Cards Section - Mobile: Stack vertically, Large: Left side */}
                        <div className='lg:col-span-6 order-2 lg:order-1'>
                            <div className='left-content-section'>
                                <h1 className="text-3xl font-bold mb-6 text-[#00CA40]">
                                    {staticData.find(item => item.id === diceTexts[currentIndex]?.id)?.title || ''}
                                </h1>
                                
                                <div className="-space-y-1">
                                    {staticData.find(item => item.id === diceTexts[currentIndex]?.id)?.liData?.map((item, index) => (
                                        <div key={index} className=" rounded-lg p-4 border border-white/20">
                                            <h3 className="text-lg font-semibold text-slate-700 mb-2">
                                                {item.subTitle}
                                            </h3>
                                            <p className="text-slate-500 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Content Section - Mobile: Top, Large: Right side */}
                        <div className='lg:col-span-6 order-1 lg:order-2'>

                            <div
                                ref={containerRef}
                                className='relative cursor-pointer px-4 sm:px-6 lg:px-[30px] py-8 sm:py-12 lg:py-[80px] min-h-[140px] sm:min-h-[280px] lg:min-h-[340px]'
                                style={{
                                    perspective: '1200px',
                                    transformStyle: 'preserve-3d'
                                }}
                            >
                                {/* Layer 0: Light Blue Card Background (Deepest Layer - Hidden initially) */}
                                <div
                                    ref={lightBlueRef}
                                    className='absolute inset-0 rounded-2xl'
                                    style={{
                                        background: 'linear-gradient(135deg, #87CEEB, #87CEFA)',
                                        transformStyle: 'preserve-3d',
                                        transformOrigin: 'center center',
                                        zIndex: 0,
                                        opacity: 0  // Hidden initially
                                    }}
                                >
                                </div>

                                {/* Layer 1: Blue Card Background (Bottom Layer) */}
                                <div
                                    ref={cardRef}
                                    className='bg-[#4E73FF] absolute inset-0 rounded-2xl'
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        transformOrigin: 'center center',
                                        zIndex: 1
                                    }}
                                >
                                </div>

                                {/* Layer 2: Text Shadow (Middle Layer) */}
                                <div
                                    ref={shadowRef}
                                    className='absolute inset-0 px-4 sm:px-6 lg:px-[30px] py-8 sm:py-12 lg:py-[80px] text-2xl sm:text-4xl lg:text-4xl font-semibold leading-tight lg:leading-normal text-slate-700 pointer-events-none'
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        transformOrigin: 'center center',
                                        opacity: 0.4,
                                        zIndex: 2
                                    }}
                                >
                                    <div className="block">AIIF + <span ref={diceShadowRef} style={{ display: 'inline-block', transformStyle: 'preserve-3d' }}>StartupTN</span></div>
                                    <div className="block">Connect</div>
                                </div>

                                {/* Layer 3: Black Circle (Between shadow and text, behind upTN only) */}
                                <div
                                    ref={circleRef}
                                    className='w-16 h-16 sm:w-20 sm:h-20 lg:w-[120px] lg:h-[120px] bg-white rounded-full absolute pointer-events-none'
                                    style={{
                                        bottom: 'calc(22% - 10px)',
                                        right: '5%',
                                        transformStyle: 'preserve-3d',
                                        transformOrigin: 'center center',
                                        zIndex: 3
                                    }}
                                >
                                    <img 
                                        ref={diceImageRef}
                                        src="/webp/startup/startup.webp" 
                                        alt="logo" 
                                        width={100}
                                        height={100}
                                        quality={100}
                                        className="w-[7.5rem] h-[5rem] md:h-[7.5rem] object-contain rounded-full"
                                    />
                                </div>

                                {/* Layer 4: Main Text (Top Layer) */}
                                <div
                                    ref={textRef}
                                    className='absolute inset-0 px-4 sm:px-6 lg:px-[30px] py-8 sm:py-12 lg:py-[80px] text-2xl sm:text-4xl lg:text-4xl text-white font-semibold leading-tight lg:leading-normal pointer-events-none'
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        transformOrigin: 'center center',
                                        zIndex: 4
                                    }}
                                >
                                    <div className="block">AIIF + <span ref={diceTextRef} style={{ display: 'inline-block', transformStyle: 'preserve-3d' }}>StartupTN</span></div>
                                    <div className="block">Connect</div>
                                </div>

                            </div>

                            <div className='mt-8 sm:mt-12 lg:mt-[80px] flex flex-col gap-4 sm:gap-6 lg:gap-[20px]'>
                                <p className='text-[#4e73ff] text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight'>State Ecosystem Integration</p>

                                <p className='text-base sm:text-lg lg:text-xl font-light leading-relaxed'>Start your innovation journey with AJK AIIF. Join a vibrant ecosystem of thinkers, makers, and doers.</p>

                                <button
                                    type="submit"
                                    className="w-fit px-6 sm:px-8 lg:px-[30px] py-2 sm:py-3 lg:py-[5px] bg-transparent text-[#4e73ff] font-outfit font-medium text-sm sm:text-base lg:text-[14px] leading-[30px] rounded-md flex items-center justify-center gap-2 border relative overflow-hidden group transition-colors duration-300 cursor-pointer border-[#4e73ff] hover:scale-105 transform transition-transform"
                                >
                                    <div className="absolute inset-0 bg-[#4e73ff] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                                    <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                                        Register Now
                                    </span>
                                </button>

                            </div>

                        </div>



                    </div>


                    <div >

                        <RoboSection />
                    </div>

                </div>

            </LayoutWrapper>
        </>
    )
}

export default page