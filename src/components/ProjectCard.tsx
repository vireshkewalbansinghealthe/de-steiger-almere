'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Archive, ArrowRight, Building, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NU IN DE VERKOOP':
        return 'bg-green-100 text-green-800';
      case 'COMING SOON':
        return 'bg-yellow-100 text-yellow-800';
      case 'UITVERKOCHT':
        return 'bg-red-100 text-red-800';
      case 'LAATSTE UNITS':
        return 'bg-orange-100 text-orange-800';
      case 'FASE 2':
        return 'bg-slate-100 text-slate-800';
      case 'NOG ÉÉN UNIT':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NU IN DE VERKOOP':
        return 'Nu in verkoop';
      case 'COMING SOON':
        return 'Binnenkort';
      case 'UITVERKOCHT':
        return 'Uitverkocht';
      case 'LAATSTE UNITS':
        return 'Laatste units';
      case 'FASE 2':
        return 'Fase 2';
      case 'NOG ÉÉN UNIT':
        return 'Nog één unit';
      default:
        return status;
    }
  };

  // Determine if this is an opslagbox or bedrijfsunit
  const isOpslagbox = project.garageBoxes !== undefined;
  const unitCount = isOpslagbox ? project.garageBoxes : project.units;
  const unitType = isOpslagbox ? 'opslagboxen' : 'units';
  const routePath = isOpslagbox ? `/opslagbox/${project.slug}` : `/bedrijfsunit/${project.slug}`;
  const IconComponent = isOpslagbox ? Package : Building;
  
  // Image gallery navigation
  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (project.images && project.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
    }
  };
  
  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (project.images && project.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
    }
  };

  return (
    <Link href={routePath}>
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer overflow-hidden group">
        {/* Image Container with Gallery */}
        <div className="relative h-48 overflow-hidden">
          {project.images && project.images.length > 0 ? (
            <img
              src={project.images[currentImageIndex]}
              alt={project.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <IconComponent className="h-16 w-16 text-slate-400" />
            </div>
          )}
          
          {/* Navigation Arrows - only show if multiple images */}
          {project.images && project.images.length > 1 && (
            <>
              {/* Left Arrow */}
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {/* Right Arrow */}
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              
              {/* Image Counter */}
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {currentImageIndex + 1} / {project.images.length}
              </div>
            </>
          )}
          
          {/* Hover overlay with arrow */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
            <ArrowRight className="h-5 w-5 text-slate-800" />
          </div>
          
          {/* Status badge - positioned to avoid price overlap */}
          {project.status && (
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1 shadow-lg">
              <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                {getStatusText(project.status)}
              </span>
            </div>
          )}
          
          {/* Price badge - moved to bottom-left to avoid overlap */}
          <div className="absolute bottom-4 left-4 bg-slate-800 text-white rounded-lg px-3 py-2 shadow-lg">
            <span className="text-sm font-bold">
              {project.startPrice ? project.startPrice.split(' ')[0] : 'Op aanvraag'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title and Location */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-slate-800 transition-colors duration-300">
              {project.name}
            </h3>
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{project.location}</span>
            </div>
          </div>

          {/* Key Stats - Much smaller and compact */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gray-50 rounded-md p-2 text-center">
              <div className="text-lg font-bold text-gray-900">{unitCount}</div>
              <div className="text-xs text-gray-600 capitalize">{unitType}</div>
            </div>
            <div className="bg-gray-50 rounded-md p-2 text-center">
              <div className="text-sm font-bold text-gray-600">{isOpslagbox ? project.features?.[0] || 'N/A' : 'A+ Label'}</div>
              <div className="text-xs text-gray-600">{isOpslagbox ? 'Grootte' : 'Energie'}</div>
            </div>
          </div>

          {/* Top Features */}
          {project.features && project.features.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {project.features.slice(0, 2).map((feature, index) => (
                  <span key={index} className="inline-block bg-slate-50 text-slate-700 px-2 py-1 rounded text-xs font-medium">
                    {feature}
                  </span>
                ))}
                {project.features.length > 2 && (
                  <span className="inline-block bg-gray-50 text-gray-600 px-2 py-1 rounded text-xs">
                    +{project.features.length - 2} meer
                  </span>
                )}
              </div>
            </div>
          )}

          {/* CTA Button */}
          <div className="pt-2">
            <div className="w-full text-center py-3 px-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl font-semibold hover:from-slate-900 hover:to-black transition-all duration-300 shadow-md group-hover:shadow-lg">
              Bekijk {isOpslagbox ? 'Opslagboxen' : 'Units'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;