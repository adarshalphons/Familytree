// app/api/family/route.js
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const filePath = path.join(process.cwd(), "data", "family.json");

const readData = () => JSON.parse(fs.readFileSync(filePath));
const writeData = (data) =>
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// Recursively find and perform actions
const findById = (node, id) => {
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const found = findById(child, id);
    if (found) return found;
  }
  return null;
};

const updateById = (node, id, updated) => {
  if (node.id === id) {
    Object.assign(node, updated);
    return true;
  }
  return node.children?.some((child) => updateById(child, id, updated));
};

const deleteById = (node, id) => {
  node.children = node.children.filter((child) => child.id !== id);
  node.children?.forEach((child) => deleteById(child, id));
};

export async function GET() {
  try {
    const data = readData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { parentId, newMember } = await request.json();
    const data = readData();

    const parentNode = findById(data, parentId);
    if (!parentNode) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    parentNode.children.push({ ...newMember, children: [] });
    writeData(data);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, updatedMember } = await request.json();
    const data = readData();

    const success = updateById(data, id, updatedMember);
    if (!success) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    writeData(data);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    const data = readData();

    if (data.id === id) {
      return NextResponse.json({ error: "Can't delete root member" }, { status: 400 });
    }

    deleteById(data, id);
    writeData(data);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}
