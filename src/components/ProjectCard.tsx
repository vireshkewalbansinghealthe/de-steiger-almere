'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  availability?: {
    available: number;
    reserved: number;
    sold: number;
    total: number;
    minPrice?: number;
    minGrossArea?: number;
  };
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, availability }) => {
  const isOpslagbox = project.garageBoxes !== undefined;
  const routePath = isOpslagbox ? `/opslagbox/${project.slug}` : `/bedrijfsunit/${project.slug}`;

  // Status badge from real availability data
  const getStatusBadge = () => {
    if (!availability) return { label: 'Beschikbaar', color: 'bg-green-500 text-white' };
    const { available, reserved, sold } = availability;
    if (available === 0 && sold > 0 && reserved === 0) return { label: 'Uitverkocht', color: 'bg-gray-500 text-white' };
    if (available === 0 && reserved > 0) return { label: 'Gereserveerd', color: 'bg-red-500 text-white' };
    return { label: 'Beschikbaar', color: 'bg-green-500 text-white' };
  };

  const badge = getStatusBadge();

  // Units count label
  const availableCount = availability?.available ?? 0;
  const unitWord = availableCount === 1 ? 'unit' : 'units';
  const countLabel = availableCount > 0
    ? `${availableCount} ${unitWord} beschikbaar`
    : availability
      ? (availability.reserved > 0 ? 'Gereserveerd' : 'Uitverkocht')
      : `${isOpslagbox ? project.garageBoxes : project.units} units`;

  // Price: prefer real API price, fall back to static startPrice
  const priceDisplay = (() => {
    if (availability?.minPrice) {
      return `€${availability.minPrice.toLocaleString('nl-NL')}`;
    }
    if (project.startPrice) {
      // Extract just "€ 329,810" from "€ 329,810 v.o.n. ex. BTW"
      const parts = project.startPrice.split(' ');
      return parts.slice(0, 2).join(' ');
    }
    return 'Op aanvraag';
  })();

  // Gross area: prefer real API value, fall back to feature text
  const areaDisplay = (() => {
    if (availability?.minGrossArea) {
      return `${availability.minGrossArea} m²`;
    }
    const brutoFeature = (project.features || []).find(f => f.toLowerCase().includes('bruto'));
    if (brutoFeature) return brutoFeature.replace('bruto', '').trim();
    return null;
  })();

  // Derive per-type floorplan image path from project name, e.g. "Opslagbox Type 13" → "/images/floorplans/Opslagbox_Type_13.png"
  const floorplanImage = `/images/floorplans/${project.name.replace(/\s+/g, '_')}.png`;
  const fallbackImage = project.images?.[0] || null;
  const [imgSrc, setImgSrc] = useState<string>(floorplanImage);
  const [imgError, setImgError] = useState(false);

  const handleImgError = () => {
    if (!imgError && fallbackImage) {
      setImgError(true);
      setImgSrc(fallbackImage);
    }
  };

  return (
    <Link href={routePath} className="block bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow cursor-pointer relative">

      {/* Image */}
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={project.name}
          className={!imgError && isOpslagbox ? 'w-full h-48 object-contain bg-white p-4' : 'w-full h-48 object-cover'}
          onError={handleImgError}
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200" />
      )}

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{project.name}</h3>
        <p className="text-sm text-gray-600 mb-1">{countLabel}</p>
        <p className="text-sm text-gray-600 mb-3">{project.location}</p>

        <div className="flex justify-between items-center">
          {areaDisplay && (
            <div>
              <p className="text-xs text-gray-500">Oppervlakte</p>
              <p className="text-sm font-semibold">{areaDisplay}</p>
            </div>
          )}
          <div className={areaDisplay ? '' : 'ml-auto'}>
            <p className="text-xs text-gray-500">Prijs</p>
            <p className="text-lg font-bold text-yellow-600">{priceDisplay}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
