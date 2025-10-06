import React, { useState, useEffect } from 'react';
import { HomeIcon } from '@heroicons/react/24/outline';

const indoorWellnessTips = [
  { icon: '🪴', tip: 'Place a spider plant in your bedroom - it removes 87% of toxins in 24 hours.' },
  { icon: '🌬️', tip: 'Open windows for 10 minutes in early morning when outdoor air is cleanest.' },
  { icon: '🧹', tip: 'Vacuum with HEPA filter twice weekly to reduce indoor allergens by 50%.' },
  { icon: '💨', tip: 'Run kitchen exhaust fan while cooking to prevent NO₂ buildup from gas stoves.' },
  { icon: '🚿', tip: 'Shower after outdoor activities to remove pollen from hair and skin.' },
  { icon: '🛏️', tip: 'Wash bedding weekly in hot water (130°F) to eliminate dust mites.' },
  { icon: '🌡️', tip: 'Keep humidity between 30-50% to prevent mold growth and dust mite proliferation.' },
  { icon: '🔌', tip: 'Unplug air fresheners - they release VOCs that can trigger respiratory symptoms.' },
  { icon: '🧴', tip: 'Switch to fragrance-free cleaning products to reduce indoor air irritants.' },
  { icon: '👟', tip: 'Remove shoes at the door to avoid tracking outdoor pollutants inside.' },
  { icon: '🪟', tip: 'Use window screens to filter pollen while allowing fresh air circulation.' },
  { icon: '🌿', tip: 'Add a peace lily to your living room - it absorbs mold spores naturally.' },
  { icon: '🔥', tip: 'Avoid burning candles or incense - they release PM2.5 particles indoors.' },
  { icon: '🧽', tip: 'Clean air purifier filters monthly for optimal performance.' },
  { icon: '🚪', tip: 'Keep bedroom door closed during high pollen days to create a clean air sanctuary.' },
  { icon: '🌊', tip: 'Use a humidifier in winter when indoor air is dry (below 30% humidity).' },
  { icon: '🧊', tip: 'Run AC on "recirculate" during high outdoor pollution to filter indoor air.' },
  { icon: '🍳', tip: 'Use electric stove instead of gas when possible to reduce indoor NO₂ by 70%.' },
  { icon: '🧺', tip: 'Dry laundry indoors during high pollen season to avoid pollen transfer.' },
  { icon: '🪴', tip: 'Place bamboo palm near your workspace - it releases oxygen and filters benzene.' },
  { icon: '🛋️', tip: 'Choose leather or vinyl furniture over fabric to minimize allergen accumulation.' },
  { icon: '🧹', tip: 'Dust with damp cloth instead of dry dusting to prevent particle resuspension.' },
  { icon: '🌬️', tip: 'Position air purifier 6-10 feet from walls for maximum air circulation.' },
  { icon: '🪟', tip: 'Install window film to block UV rays while maintaining natural light.' },
  { icon: '🧴', tip: 'Store cleaning products in sealed containers to prevent VOC off-gassing.' },
  { icon: '🛏️', tip: 'Use allergen-proof mattress covers to reduce dust mite exposure by 90%.' },
  { icon: '🌡️', tip: 'Keep indoor temperature below 70°F to slow dust mite reproduction.' },
  { icon: '🪴', tip: 'Add a snake plant to your bedroom - it releases oxygen at night.' },
  { icon: '🧽', tip: 'Clean bathroom exhaust fan quarterly to prevent mold spore circulation.' },
  { icon: '🚪', tip: 'Use door draft stoppers to prevent outdoor pollutants from entering.' },
  { icon: '🌱', tip: 'Aloe vera plants purify air and require minimal maintenance - perfect for bedrooms.' },
  { icon: '🧴', tip: 'Use vinegar and baking soda for cleaning - natural and VOC-free alternatives.' },
  { icon: '🪟', tip: 'Replace window treatments every 3-5 years as they accumulate allergens over time.' },
  { icon: '🧹', tip: 'Microfiber cloths trap 99% of dust compared to 30% for regular cloths.' },
  { icon: '🌡️', tip: 'Use a dehumidifier in basements to keep humidity below 50% and prevent mold.' },
  { icon: '🛏️', tip: 'Encase pillows in allergen-proof covers - they collect more dust mites than mattresses.' },
  { icon: '🪴', tip: 'Boston ferns remove formaldehyde and add humidity naturally to dry indoor air.' },
  { icon: '🧽', tip: 'Replace kitchen sponges weekly - they harbor bacteria and mold spores.' },
  { icon: '🚪', tip: 'Install weather stripping on doors to prevent outdoor allergens from entering.' },
  { icon: '🌬️', tip: 'Change HVAC filters every 1-3 months for optimal air filtration.' },
  { icon: '🧴', tip: 'Avoid aerosol sprays - they release fine particles that linger in air for hours.' },
  { icon: '🪟', tip: 'Clean window tracks monthly - they collect pollen, dust, and mold.' },
  { icon: '🛏️', tip: 'Freeze stuffed animals for 24 hours monthly to kill dust mites.' },
  { icon: '🌡️', tip: 'Maintain indoor temperature at 68-72°F for optimal comfort and air quality.' },
  { icon: '🪴', tip: 'English ivy reduces airborne mold by 94% within 12 hours.' },
  { icon: '🧹', tip: 'Vacuum mattresses monthly to remove dead skin cells and dust mites.' },
  { icon: '🚿', tip: 'Run bathroom fan for 20 minutes after showering to prevent mold growth.' },
  { icon: '🌬️', tip: 'Open windows on opposite sides of home for cross-ventilation and better air exchange.' },
  { icon: '🧴', tip: 'Choose water-based paints over oil-based to reduce VOC emissions.' },
  { icon: '🪟', tip: 'Wash curtains every 3-6 months in hot water to remove accumulated allergens.' },
  { icon: '🛏️', tip: 'Use cotton or bamboo bedding - they resist dust mites better than synthetic fabrics.' },
  { icon: '🌡️', tip: 'Monitor indoor humidity with a hygrometer - ideal range is 30-50%.' },
  { icon: '🪴', tip: 'Rubber plants remove toxins and thrive in low light conditions.' },
  { icon: '🧽', tip: 'Clean refrigerator drip pans every 3 months to prevent mold growth.' },
  { icon: '🚪', tip: 'Use a boot tray with pebbles at entrance to catch outdoor pollutants.' },
  { icon: '🌬️', tip: 'Point fans toward windows when exhausting indoor air during cooking.' },
  { icon: '🧴', tip: 'Let new furniture off-gas in garage for 72 hours before bringing indoors.' },
  { icon: '🪟', tip: 'Use cellular shades - they trap allergens better than horizontal blinds.' },
  { icon: '🛏️', tip: 'Wash pillows every 4-6 months to remove accumulated oils and allergens.' },
  { icon: '🌡️', tip: 'Use exhaust fans in bathrooms and kitchens to remove excess moisture.' },
  { icon: '🪴', tip: 'Dracaena plants remove benzene, formaldehyde, and trichloroethylene from air.' },
  { icon: '🧹', tip: 'Steam clean carpets annually to kill dust mites and remove deep allergens.' },
  { icon: '🚿', tip: 'Fix leaky faucets immediately - even small drips can cause mold growth.' },
  { icon: '🌬️', tip: 'Use ceiling fans in summer to improve air circulation and reduce AC use.' },
  { icon: '🧴', tip: 'Store shoes in closed containers to prevent mold growth and odor.' },
  { icon: '🪟', tip: 'Clean air vents and registers quarterly to prevent dust buildup.' },
  { icon: '🛏️', tip: 'Avoid down pillows if allergic - synthetic alternatives are hypoallergenic.' },
  { icon: '🌡️', tip: 'Use programmable thermostat to maintain consistent temperature and humidity.' },
  { icon: '🪴', tip: 'Philodendron plants are excellent at removing formaldehyde from indoor air.' },
  { icon: '🧽', tip: 'Wipe down shower walls after each use to prevent soap scum and mold.' },
  { icon: '🚪', tip: 'Install door sweeps on exterior doors to block allergens and drafts.' },
  { icon: '🌬️', tip: 'Use bathroom exhaust fans during and after showers to control humidity.' },
  { icon: '🧴', tip: 'Choose fragrance-free laundry detergent to reduce VOC exposure.' },
  { icon: '🪟', tip: 'Keep windows closed during peak pollen hours (5-10 AM).' },
  { icon: '🛏️', tip: 'Flip and rotate mattresses every 3 months to reduce dust mite accumulation.' },
  { icon: '🌡️', tip: 'Use portable dehumidifiers in damp areas like basements and bathrooms.' },
  { icon: '🪴', tip: 'Golden pothos plants thrive in low light and remove indoor air toxins.' },
  { icon: '🧹', tip: 'Use doormats both outside and inside entrances to trap more pollutants.' },
  { icon: '🚿', tip: 'Clean shower curtains monthly in washing machine to prevent mold.' },
  { icon: '🌬️', tip: 'Open windows for 5-10 minutes daily even in winter for fresh air exchange.' },
  { icon: '🧴', tip: 'Avoid fabric softeners - they leave residue that can irritate airways.' },
  { icon: '🪟', tip: 'Use HEPA vacuum attachments to clean window treatments without spreading dust.' },
  { icon: '🛏️', tip: 'Choose platform beds over box springs - fewer hiding spots for dust mites.' },
  { icon: '🌡️', tip: 'Insulate pipes to prevent condensation that can lead to mold growth.' },
  { icon: '🪴', tip: 'ZZ plants require little water and effectively remove air toxins.' },
  { icon: '🧽', tip: 'Clean under appliances annually - common spot for dust and allergen buildup.' },
  { icon: '🚪', tip: 'Use automatic door closers to minimize time doors are open to outdoor air.' },
  { icon: '🌬️', tip: 'Install carbon monoxide detectors near bedrooms and fuel-burning appliances.' },
  { icon: '🧴', tip: 'Choose solid wood furniture over particleboard to reduce formaldehyde exposure.' },
  { icon: '🪟', tip: 'Use window fans to exhaust indoor air at night when outdoor air is cleaner.' },
  { icon: '🛏️', tip: 'Minimize bedroom clutter - fewer surfaces mean less dust accumulation.' },
  { icon: '🌡️', tip: 'Seal cracks and gaps in walls to prevent moisture intrusion and mold.' },
  { icon: '🪴', tip: 'Chinese evergreen plants are low-maintenance and filter multiple toxins.' },
  { icon: '🧹', tip: 'Use entrance mats that are at least 4 feet long for better pollutant capture.' },
  { icon: '🚿', tip: 'Squeegee shower walls after use to reduce moisture and prevent mold.' },
  { icon: '🌬️', tip: 'Test home for radon gas - it\'s odorless but can cause serious health issues.' },
  { icon: '🧴', tip: 'Use beeswax or soy candles instead of paraffin to reduce indoor air pollution.' },
  { icon: '🪟', tip: 'Install window guards with filters to allow ventilation while blocking pollen.' },
  { icon: '🛏️', tip: 'Keep pets out of bedrooms to reduce dander exposure during sleep.' },
  { icon: '🌡️', tip: 'Use exhaust fans rated for room size - undersized fans are ineffective.' },
  { icon: '🪴', tip: 'Gerbera daisies remove benzene and improve bedroom air quality.' },
  { icon: '🧽', tip: 'Clean washing machine monthly to prevent mold growth in drum and seals.' },
  { icon: '🚪', tip: 'Install air curtains above frequently used doors to block outdoor pollutants.' },
  { icon: '🌬️', tip: 'Use kitchen range hoods that vent outside rather than recirculating models.' },
  { icon: '🧴', tip: 'Choose low-VOC or zero-VOC adhesives and sealants for home repairs.' },
  { icon: '🪟', tip: 'Clean window screens annually - they trap pollen and dust over time.' },
  { icon: '🛏️', tip: 'Use zippered allergen covers - they\'re more effective than fitted covers.' },
  { icon: '🌡️', tip: 'Vent clothes dryers outside to prevent moisture buildup indoors.' },
  { icon: '🪴', tip: 'Areca palms are excellent natural humidifiers and air purifiers.' },
  { icon: '🧹', tip: 'Vacuum upholstered furniture weekly using HEPA-filtered vacuum.' },
  { icon: '🚿', tip: 'Replace shower heads every 6 months to prevent bacterial buildup.' },
  { icon: '🌬️', tip: 'Use air quality monitors to track indoor pollutant levels in real-time.' },
  { icon: '🧴', tip: 'Store gasoline, paint, and chemicals in detached garage or shed.' },
  { icon: '🪟', tip: 'Use blackout curtains to reduce UV damage and maintain consistent temperature.' },
  { icon: '🛏️', tip: 'Wash comforters and duvets every 2-3 months in hot water.' },
  { icon: '🌡️', tip: 'Install bathroom fans on timers to ensure adequate moisture removal.' },
];

const IndoorWellnessTip: React.FC = () => {
  const [dailyTip, setDailyTip] = useState(indoorWellnessTips[0]);

  useEffect(() => {
    // Get day of year to show consistent tip for the day
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    const tipIndex = dayOfYear % indoorWellnessTips.length;
    setDailyTip(indoorWellnessTips[tipIndex]);
  }, []);

  return (
    <div className="card bg-gradient-to-br from-green-50 to-blue-50">
      <div className="flex items-center mb-3">
        <HomeIcon className="w-5 h-5 text-green-600 mr-2" />
        <h3 className="text-sm font-semibold text-gray-900">Indoor Wellness Tip</h3>
      </div>
      
      <div className="flex items-start space-x-3">
        <div className="text-3xl flex-shrink-0">{dailyTip.icon}</div>
        <p className="text-sm text-gray-700 leading-relaxed flex-1">
          {dailyTip.tip}
        </p>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          💡 New tip daily
        </p>
      </div>
    </div>
  );
};

export default IndoorWellnessTip;
