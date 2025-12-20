
export const isPowerUnit = (templateId?: string): boolean => {
  if (!templateId) return false;
  return (
    templateId === 'c_ranger' || 
    templateId === 'c_musketeer' ||
    templateId === 'e_musketeer_enemy' ||
    templateId === 'e_warg_alpha'
  );
};

export const isMagicUnit = (templateId?: string, name: string = ''): boolean => {
  return (
    templateId === 'c_mage' || 
    templateId === 'c_arcanist' ||
    name.includes('Mage') || 
    name.includes('Arcanist')
  );
};
