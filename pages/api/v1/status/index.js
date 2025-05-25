import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();
  const postgresVersionResult = await database.query("SHOW server_version;");
  const postgresVersionValue = postgresVersionResult?.rows?.[0]?.server_version;

  const postgresMaxConectionsResult = await database.query(
    "SHOW max_connections;"
  );
  const postgresMaxConectionsValue =
    postgresMaxConectionsResult?.rows?.[0]?.max_connections;

  const databaseName = process.env.POSTGRES_DB;

  const postgresOpenConectionsResult = await database.query({
    text: `SELECT count(*)::int from pg_stat_activity WHERE datname = $1;`,
    values: [databaseName],
  });
  const postgresOpenConectionsValue =
    postgresOpenConectionsResult?.rows?.[0]?.count;

  const responseBody = {
    dependencies: {
      database: {
        version: postgresVersionValue,
        max_conections: parseInt(postgresMaxConectionsValue),
        open_conections: postgresOpenConectionsValue,
      },
    },
    updated_at: updatedAt,
  };

  response.status(200).json(responseBody);
}

export default status;
