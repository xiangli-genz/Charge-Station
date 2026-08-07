import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import PermissionGroup, { IPermissionGroup } from '../models/PermissionGroup';
import User, { IUser, ManagedUserStatus, UserRole } from '../models/User';

const SALT_ROUNDS = 10;

interface PermissionGroupSummary {
  id: string;
  name: string;
  code: string;
}

export interface ManagedUserResponse {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  email: string;
  role: UserRole;
  status: ManagedUserStatus;
  userType: string;
  description: string;
  address: string;
  landingPage: string;
  walletBalance: number;
  createdById: string | null;
  permissionGroup: PermissionGroupSummary | null;
  childCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ManagedUserTreeNode extends ManagedUserResponse {
  children: ManagedUserTreeNode[];
}

export interface ManagedUserTreeResponse {
  items: ManagedUserResponse[];
  tree: ManagedUserTreeNode[];
  total: number;
}

interface CreateManagedUserInput {
  username?: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  walletBalance: number;
  parentId?: string;
  status?: ManagedUserStatus;
  userType?: string;
  description?: string;
  address?: string;
  landingPage?: string;
  permissionGroupId?: string | null;
}

interface UpdateManagedUserInput {
  username?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  password?: string;
  walletBalance?: number;
  parentId?: string;
  status?: ManagedUserStatus;
  userType?: string;
  description?: string;
  address?: string;
  landingPage?: string;
  permissionGroupId?: string | null;
}

const normalizeUsernameCandidate = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
};

const defaultUsernameFromEmail = (email: string): string => {
  const localPart = email.split('@')[0] || 'user';
  return normalizeUsernameCandidate(localPart) || 'user';
};

const generateResetPassword = (): string => {
  return String(Math.floor(10000000 + Math.random() * 90000000));
};

const buildPermissionGroupMap = async (
  users: IUser[]
): Promise<Map<string, PermissionGroupSummary>> => {
  const permissionGroupIds = [
    ...new Set(
      users
        .map((user) => user.permissionGroupId?.toString())
        .filter((value): value is string => Boolean(value))
    ),
  ];

  if (!permissionGroupIds.length) {
    return new Map<string, PermissionGroupSummary>();
  }

  const groups = await PermissionGroup.find({
    _id: { $in: permissionGroupIds },
  }).sort({ createdAt: -1 });

  return new Map<string, PermissionGroupSummary>(
    groups.map((group) => [
      group._id.toString(),
      {
        id: group._id.toString(),
        name: group.name,
        code: group.code,
      },
    ])
  );
};

const countDirectChildren = (users: IUser[]): Map<string, number> => {
  const map = new Map<string, number>();

  for (const user of users) {
    const parentId = user.createdById;

    if (!parentId) {
      continue;
    }

    map.set(parentId, (map.get(parentId) || 0) + 1);
  }

  return map;
};

const toManagedUserResponse = (
  user: IUser,
  permissionGroupMap: Map<string, PermissionGroupSummary>,
  childCountMap: Map<string, number>
): ManagedUserResponse => ({
  id: user._id.toString(),
  username: user.username || defaultUsernameFromEmail(user.email),
  fullName: user.fullName,
  phone: user.phone,
  email: user.email,
  role: user.role,
  status: user.status || 'active',
  userType: user.userType || 'Nguoi dung',
  description: user.description || '',
  address: user.address || '',
  landingPage: user.landingPage || 'map',
  walletBalance: user.walletBalance,
  createdById: user.createdById ?? null,
  permissionGroup: user.permissionGroupId
    ? permissionGroupMap.get(user.permissionGroupId.toString()) || null
    : null,
  childCount: childCountMap.get(user._id.toString()) || 0,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const sortByCreatedAtDesc = (users: IUser[]): IUser[] => {
  return [...users].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
};

const collectManagedDescendants = async (actorUserId: string): Promise<IUser[]> => {
  const queue: string[] = [actorUserId];
  const visitedParents = new Set<string>();
  const descendants = new Map<string, IUser>();

  while (queue.length > 0) {
    const parentId = queue.shift();

    if (!parentId || visitedParents.has(parentId)) {
      continue;
    }

    visitedParents.add(parentId);

    const children = await User.find({ createdById: parentId }).sort({ createdAt: -1 });

    for (const child of children) {
      const childId = child._id.toString();

      if (descendants.has(childId)) {
        continue;
      }

      descendants.set(childId, child);
      queue.push(childId);
    }
  }

  return sortByCreatedAtDesc(Array.from(descendants.values()));
};

const collectSubtreeUserIds = async (rootUserId: string): Promise<string[]> => {
  const queue: string[] = [rootUserId];
  const visited = new Set<string>();
  const subtreeIds: string[] = [];

  while (queue.length > 0) {
    const currentUserId = queue.shift();

    if (!currentUserId || visited.has(currentUserId)) {
      continue;
    }

    visited.add(currentUserId);
    subtreeIds.push(currentUserId);

    const children = await User.find({ createdById: currentUserId }).select('_id');

    for (const child of children) {
      queue.push(child._id.toString());
    }
  }

  return subtreeIds;
};

const ensureParentAssignmentIsSafe = async (
  userId: string,
  parentId: string
): Promise<void> => {
  if (userId === parentId) {
    throw new Error('Khong the chon chinh tai khoan nay lam tai khoan cha');
  }

  const subtreeIds = await collectSubtreeUserIds(userId);

  if (subtreeIds.includes(parentId)) {
    throw new Error('Khong the chon tai khoan con trong cung nhanh lam tai khoan cha');
  }
};

const isUserManagedByActor = async (actorUserId: string, user: IUser): Promise<boolean> => {
  if (user._id.toString() === actorUserId) {
    return true;
  }

  const visited = new Set<string>();
  let currentParentId = user.createdById ?? null;

  while (currentParentId) {
    if (currentParentId === actorUserId) {
      return true;
    }

    if (visited.has(currentParentId)) {
      break;
    }

    visited.add(currentParentId);

    const parentUser = await User.findById(currentParentId);

    if (!parentUser) {
      break;
    }

    currentParentId = parentUser.createdById ?? null;
  }

  return false;
};

const ensureUniqueIdentityFields = async (params: {
  email: string;
  phone: string;
  username: string;
  excludeUserId?: string;
}): Promise<void> => {
  const existingUsers = await User.find({
    $or: [{ email: params.email }, { phone: params.phone }, { username: params.username }],
  });

  for (const existingUser of existingUsers) {
    if (params.excludeUserId && existingUser._id.toString() === params.excludeUserId) {
      continue;
    }

    if (existingUser.email === params.email) {
      throw new Error('Email da ton tai');
    }

    if (existingUser.phone === params.phone) {
      throw new Error('So dien thoai da ton tai');
    }

    if (existingUser.username === params.username) {
      throw new Error('Tai khoan da ton tai');
    }
  }
};

const resolveAvailableUsername = async (
  preferredUsername: string,
  excludeUserId?: string
): Promise<string> => {
  let candidate = normalizeUsernameCandidate(preferredUsername) || 'user';
  let suffix = 0;

  while (true) {
    const username = suffix === 0 ? candidate : `${candidate}-${suffix}`;
    const existingUser = await User.findOne({ username });

    if (!existingUser || (excludeUserId && existingUser._id.toString() === excludeUserId)) {
      return username;
    }

    suffix += 1;
  }
};

const resolvePermissionGroup = async (
  permissionGroupId: string | null | undefined
): Promise<IPermissionGroup | null> => {
  if (!permissionGroupId) {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(permissionGroupId)) {
    throw new Error('Nhom quyen khong hop le');
  }

  const group = await PermissionGroup.findById(permissionGroupId);

  if (!group) {
    throw new Error('Nhom quyen khong ton tai');
  }

  return group;
};

const resolveManagedParentId = async (
  actorUserId: string,
  parentId?: string
): Promise<string> => {
  if (!parentId || parentId === actorUserId) {
    return actorUserId;
  }

  const parentUser = await User.findById(parentId);

  if (!parentUser) {
    throw new Error('Tai khoan cha khong ton tai');
  }

  const isManagedParent = await isUserManagedByActor(actorUserId, parentUser);

  if (!isManagedParent) {
    throw new Error('Tai khoan cha khong thuoc nhanh quan ly cua ban');
  }

  return parentUser._id.toString();
};

const getManagedUserById = async (actorUserId: string, userId: string): Promise<IUser> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('Tai khoan khong ton tai');
  }

  if (user._id.toString() === actorUserId) {
    throw new Error('Khong the thao tac tren tai khoan goc cua chinh ban trong cay nguoi dung');
  }

  const isManagedUser = await isUserManagedByActor(actorUserId, user);

  if (!isManagedUser) {
    throw new Error('Tai khoan nay khong thuoc nhanh quan ly cua ban');
  }

  return user;
};

const buildManagedTree = (
  items: ManagedUserResponse[],
  actorUserId: string
): ManagedUserTreeNode[] => {
  const nodeMap = new Map<string, ManagedUserTreeNode>();
  const roots: ManagedUserTreeNode[] = [];

  for (const item of items) {
    nodeMap.set(item.id, {
      ...item,
      children: [],
    });
  }

  for (const item of items) {
    const node = nodeMap.get(item.id);

    if (!node) {
      continue;
    }

    const parentNode = item.createdById ? nodeMap.get(item.createdById) : undefined;

    if (!parentNode || item.createdById === actorUserId) {
      roots.push(node);
      continue;
    }

    parentNode.children.push(node);
  }

  const decorateChildren = (nodes: ManagedUserTreeNode[]): ManagedUserTreeNode[] => {
    nodes.sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());

    for (const node of nodes) {
      node.children = decorateChildren(node.children);
    }

    return nodes;
  };

  return decorateChildren(roots);
};

const toManagedUserResponses = async (users: IUser[]): Promise<ManagedUserResponse[]> => {
  const permissionGroupMap = await buildPermissionGroupMap(users);
  const childCountMap = countDirectChildren(users);

  return users.map((user) => toManagedUserResponse(user, permissionGroupMap, childCountMap));
};

const toManagedUserResponseSingle = async (user: IUser): Promise<ManagedUserResponse> => {
  const users = await User.find({
    $or: [{ _id: user._id }, { createdById: user._id.toString() }],
  });
  const permissionGroupMap = await buildPermissionGroupMap([user]);
  const childCountMap = countDirectChildren(users);

  return toManagedUserResponse(user, permissionGroupMap, childCountMap);
};

export const getManagedUserTree = async (actorUserId: string): Promise<ManagedUserTreeResponse> => {
  const users = await collectManagedDescendants(actorUserId);
  const items = await toManagedUserResponses(users);

  return {
    items,
    tree: buildManagedTree(items, actorUserId),
    total: items.length,
  };
};

export const createManagedChildUser = async (
  actorUserId: string,
  input: CreateManagedUserInput
): Promise<ManagedUserResponse> => {
  const createdById = await resolveManagedParentId(actorUserId, input.parentId);
  const usernameCandidate =
    normalizeUsernameCandidate(input.username || '') || defaultUsernameFromEmail(input.email);
  const username = await resolveAvailableUsername(usernameCandidate);
  const permissionGroup = await resolvePermissionGroup(input.permissionGroupId);

  await ensureUniqueIdentityFields({
    email: input.email,
    phone: input.phone,
    username,
  });

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await User.create({
    username,
    fullName: input.fullName,
    phone: input.phone,
    email: input.email,
    passwordHash,
    walletBalance: input.walletBalance,
    createdById,
    role: 'customer',
    status: input.status || 'active',
    userType: input.userType || 'Nguoi dung',
    description: input.description || '',
    address: input.address || '',
    landingPage: input.landingPage || 'map',
    permissionGroupId: permissionGroup?._id || null,
  });

  return toManagedUserResponseSingle(user);
};

export const updateManagedChildUser = async (
  actorUserId: string,
  userId: string,
  input: UpdateManagedUserInput
): Promise<ManagedUserResponse> => {
  const user = await getManagedUserById(actorUserId, userId);
  const nextEmail = input.email ?? user.email;
  const nextPhone = input.phone ?? user.phone;
  const nextUsername = await resolveAvailableUsername(
    normalizeUsernameCandidate(input.username || user.username || defaultUsernameFromEmail(nextEmail)),
    userId
  );
  const permissionGroup = await resolvePermissionGroup(
    input.permissionGroupId === undefined ? user.permissionGroupId?.toString() || null : input.permissionGroupId
  );

  await ensureUniqueIdentityFields({
    email: nextEmail,
    phone: nextPhone,
    username: nextUsername,
    excludeUserId: userId,
  });

  if (typeof input.fullName === 'string') {
    user.fullName = input.fullName;
  }

  if (typeof input.phone === 'string') {
    user.phone = input.phone;
  }

  if (typeof input.email === 'string') {
    user.email = input.email;
  }

  if (typeof input.walletBalance === 'number') {
    user.walletBalance = input.walletBalance;
  }

  if (typeof input.status === 'string') {
    user.status = input.status;
  }

  if (typeof input.userType === 'string') {
    user.userType = input.userType;
  }

  if (typeof input.description === 'string') {
    user.description = input.description;
  }

  if (typeof input.address === 'string') {
    user.address = input.address;
  }

  if (typeof input.landingPage === 'string') {
    user.landingPage = input.landingPage;
  }

  if (typeof input.parentId === 'string' && input.parentId.trim()) {
    await ensureParentAssignmentIsSafe(userId, input.parentId);
    user.createdById = await resolveManagedParentId(actorUserId, input.parentId);
  }

  user.username = nextUsername;
  user.permissionGroupId = permissionGroup?._id || null;

  if (input.password) {
    user.passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  }

  await user.save();
  return toManagedUserResponseSingle(user);
};

export const resetManagedChildPassword = async (
  actorUserId: string,
  userId: string
): Promise<{ item: ManagedUserResponse; password: string }> => {
  const user = await getManagedUserById(actorUserId, userId);
  const password = generateResetPassword();
  user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await user.save();

  return {
    item: await toManagedUserResponseSingle(user),
    password,
  };
};

export const deleteManagedChildUser = async (
  actorUserId: string,
  userId: string
): Promise<void> => {
  const user = await getManagedUserById(actorUserId, userId);
  const subtreeIds = await collectSubtreeUserIds(user._id.toString());
  await User.deleteMany({ _id: { $in: subtreeIds } });
};
