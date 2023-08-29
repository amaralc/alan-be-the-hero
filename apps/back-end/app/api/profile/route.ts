import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

class CreateOngDto {
  name!: string;
  email!: string;
  whatsapp!: string;
  city!: string;
  uf!: string;
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
    this.id = randomUUID()
  }
}

abstract class OrgsRepository {
  abstract create(createOngDto: CreateOngDto): Promise<OngEntity>;
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

export async function POST(request: Request) {
  const { name, email, whatsapp, city, uf } = (await request.json()) as { name: string; email: string; whatsapp: string; city: string; uf: string }
  const ong = await inMemoryOrgsRepository.create({ name, email, whatsapp, city, uf });
  return new Response(JSON.stringify(ong));
}

export async function GET() {
  const ongs = await inMemoryOrgsRepository.list();
  return new Response(JSON.stringify(ongs));
}
