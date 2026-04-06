export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { cp } = req.query;
  if (!cp) return res.status(400).json({ error: 'CP requerido' });

  // FUENTE 1 — codigos.zip
  try {
    const r = await fetch(`https://api.codigos.zip/api/zip/${cp}?pais=AR`, {
      headers: { 'X-API-Key': 'zp_38c770cff44313ae7f222e0187a4f916a6acc097f6bf8113' }
    });
    const d = await r.json();
    if (d && d.latitud && parseFloat(d.latitud) !== 0) {
      return res.status(200).json({
        localidades: [{
          nombre: d.localidad || d.ciudad || d.colonia || 'Localidad',
          provincia: d.estado || d.provincia || 'Argentina',
          lat: parseFloat(d.latitud),
          lon: parseFloat(d.longitud)
        }],
        fuente: 'codigos.zip'
      });
    }
  } catch(e) {}

  // FUENTE 2 — Georef Argentina
  try {
    const r = await fetch(
      `https://apis.datos.gob.ar/georef/api/localidades?codigo_postal=${cp}&campos=nombre,provincia.nombre,centroide&max=1`,
      { headers: { 'User-Agent': 'JustoMakario/1.0' } }
    );
    const d = await r.json();
    if (d.localidades && d.localidades.length > 0) {
      const l = d.localidades[0];
      return res.status(200).json({
        localidades: [{
          nombre: l.nombre,
          provincia: l.provincia.nombre,
          lat: l.centroide.lat,
          lon: l.centroide.lon
        }],
        fuente: 'georef'
      });
    }
  } catch(e) {}

  // FUENTE 3 — Nominatim
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${cp}&country=Argentina&format=json&limit=1&addressdetails=1`,
      { headers: { 'User-Agent': 'JustoMakario/1.0' } }
    );
    const d = await r.json();
    if (d && d.length > 0) {
      const l = d[0];
      const a = l.address || {};
      return res.status(200).json({
        localidades: [{
          nombre: a.suburb || a.city_district || a.town || a.city || a.village || 'Localidad',
          provincia: a.state || 'Argentina',
          lat: parseFloat(l.lat),
          lon: parseFloat(l.lon)
        }],
        fuente: 'nominatim'
      });
    }
  } catch(e) {}

  return res.status(404).json({ error: 'CP no encontrado' });
}
