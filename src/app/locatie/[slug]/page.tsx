'use client';

import { useState, use } from 'react';
import { notFound } from 'next/navigation';
import { projects, locations } from '@/data/projects';
import { Project } from '@/types';
import ProjectCard from '@/components/ProjectCard';
import ProjectModal from '@/components/ProjectModal';
import { MapPin, ArrowLeft, Building } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function LocationPage({ params }: PageProps) {
  const resolvedParams = use(params);

  
  const location = locations.find(loc => loc.slug === resolvedParams.slug);
  
  if (!location) {
    notFound();
  }

  const locationProjects = projects.filter(project => 
    location.projects.includes(project.id)
  );



  return (
    <>
      {/* Header with Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Terug naar overzicht
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <MapPin className="h-12 w-12 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold">
              {location.name}
            </h1>
          </div>
          
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Ontdek onze duurzame bedrijfsruimtes in {location.name}
          </p>
        </div>
      </div>

      {/* Projects Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {locationProjects.length > 0 ? (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Projecten in {location.name}
                </h2>
                <p className="text-xl text-gray-600">
                  {locationProjects.length} project{locationProjects.length !== 1 ? 'en' : ''} beschikbaar
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {locationProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-200 rounded-full mb-6">
                <Building className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Nog geen projecten in {location.name}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We zijn altijd op zoek naar nieuwe locaties. Houd onze website in de gaten voor updates.
              </p>
              <Link href="/" className="unity-btn-primary">
                Bekijk alle projecten
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Interesse in projecten in {location.name}?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Schrijf je in voor onze nieuwsbrief en blijf op de hoogte van nieuwe ontwikkelingen!
          </p>
          
          <div className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Je e-mailadres"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
            <button className="unity-btn-secondary">
              Inschrijven
            </button>
          </div>
        </div>
      </div>

      {/* Project Modal */}

    </>
  );
} 