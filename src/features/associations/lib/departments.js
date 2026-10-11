export const ALL_DEPARTMENTS = 'all';

/** Departamentos donde la asociación tiene espacios (sin repetir). */
export const departmentsOf = (association) => [
  ...new Set((association.spaces ?? []).flatMap((space) => space.departments ?? [])),
];

/** Lista ordenada de departamentos de todas las asociaciones. */
export const listDepartments = (associations) =>
  [...new Set(associations.flatMap(departmentsOf))].sort();

/** Asociaciones con al menos un espacio en el departamento. */
export const filterByDepartment = (associations, department) =>
  department === ALL_DEPARTMENTS
    ? associations
    : associations.filter((association) => departmentsOf(association).includes(department));

/** Espacios de la asociación que están en el departamento elegido. */
export const spacesIn = (association, department) =>
  (association.spaces ?? []).filter(
    (space) => department === ALL_DEPARTMENTS || (space.departments ?? []).includes(department),
  );
