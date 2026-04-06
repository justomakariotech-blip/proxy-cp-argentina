export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const { cp } = req.query;
  
  if (!cp) {
    return res.status(400).json({ error: 'CP requerido' });
  }

  try {
    const response = await fetch(
      `https://apis.datos.gob.ar/georef/api/localidades?codigo_postal=${cp}&campos=nombre,provincia.nombre,centroide&max=5`
    );
    const data = await response.json();
    
    if (!data.localidades || data.localidades.length === 0) {
      return res.status(404).json({ error: 'CP no encontrado' });
    }

    const localidades = data.localidades.map(l => ({
      nombre: l.nombre,
      provincia: l.provincia.nombre,
      lat: l.centroide.lat,
      lon: l.centroide.lon
    }));

    return res.status(200).json({ localidades });
    
  } catch (error) {
    return res.status(500).json({ error: 'Error al consultar el servicio' });
  }
}
