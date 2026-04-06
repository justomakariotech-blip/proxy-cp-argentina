export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { cp } = req.query;
  if (!cp) return res.status(400).json({ error: 'CP requerido' });

  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${cp}&country=Argentina&format=json&limit=5&addressdetails=1`;
    const r = await fetch(url, {
      headers: { 'User-Agent': 'JustoMakario-Widget/1.0' }
    });
    const data = await r.json();

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'CP no encontrado' });
    }

    const localidades = data.map(l => ({
      nombre: l.address.suburb || l.address.city_district || l.address.town || l.address.city || l.address.village || l.address.county || 'Localidad',
      provincia: l.address.state || 'Argentina',
      cp: l.address.postcode || cp,
      lat: parseFloat(l.lat),
      lon: parseFloat(l.lon)
    }));

    return res.status(200).json({ localidades });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
