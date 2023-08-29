import { randomUUID } from "crypto";
import { PrismaClient } from '@prisma/client'
const prismaClient = new PrismaClient()

class CreateOngDto {
  name!: string;
  email!: string;
  whatsapp!: string;
  city!: string;
  uf!: string;
  id?:string
}

class OngEntity extends CreateOngDto {
  id!: string;
  constructor(createOngDto:CreateOngDto){
    super();
    this.city = createOngDto.city;
    this.email = createOngDto.email;
    this.name = createOngDto.name;
    this.uf = createOngDto.uf;
    this.whatsapp = createOngDto.whatsapp;
    this.id = createOngDto.id ? createOngDto.id : randomUUID()
  }
}

abstract class OrgsRepository {
  abstract create(createOngDto: CreateOngDto): Promise<OngEntity>;
  abstract list(): Promise<OngEntity[]>;
}

class InMemoryOrgsRepository extends OrgsRepository {
  private orgs: OngEntity[] = [];

  async create(createOngDto: CreateOngDto): Promise<OngEntity> {
    const newOng = new OngEntity(createOngDto);
    this.orgs.push(newOng);
    return newOng;
  }

  async list(): Promise<OngEntity[]> {
    return this.orgs;
  }
}

const inMemoryOrgsRepository = new InMemoryOrgsRepository();

class PrismaPostgresOrgsRepository implements OrgsRepository {
  async create(createOngDto: CreateOngDto): Promise<OngEntity> {
    const prismaOrg = await prismaClient.org.create({data: createOngDto});
    const applicationOrg = new OngEntity(prismaOrg);
    return applicationOrg;
  }

  async list(): Promise<OngEntity[]> {
    const prismaOrgs = await prismaClient.org.findMany();
    const applicationOrgs = prismaOrgs.map(prismaOrg => new OngEntity(prismaOrg));
    return applicationOrgs;
  }
}

const prismaPostgresOrgsRepository = new PrismaPostgresOrgsRepository();
const databaseProvider = process.env.DATABASE_PROVIDER;
console.log('databaseProvider', databaseProvider);

export async function POST(request: Request) {
  const { name, email, whatsapp, city, uf } = (await request.json()) as { name: string; email: string; whatsapp: string; city: string; uf: string }
  if(databaseProvider === 'prisma-postgres') {
    const ong = await prismaPostgresOrgsRepository.create({ name, email, whatsapp, city, uf });
    return new Response(JSON.stringify(ong));
  } else {
    const ong = await inMemoryOrgsRepository.create({ name, email, whatsapp, city, uf });
    return new Response(JSON.stringify(ong));
  }
}

export async function GET() {
  if(databaseProvider === 'prisma-postgres') {
    const ongs = await prismaPostgresOrgsRepository.list();
    return new Response(JSON.stringify(ongs));
  } else {
    const ongs = await inMemoryOrgsRepository.list();
    return new Response(JSON.stringify(ongs));
  }
}
