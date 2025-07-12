import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createUser() {
  try {
    // User data
    const userData = {
      email: 'admin@sambatours.com',
      password: 'admin123', // This will be hashed
      profile: {
        fullName: 'Admin User',
        firstName: 'Admin',
        lastName: 'User',
        phone: '+256 700 123 456',
        country: 'Uganda',
        city: 'Kampala',
        roleId: 1, // Assuming role 1 is admin
        isActive: true
      }
    }

    // Hash the password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds)

    // Create the user with profile
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash: hashedPassword,
        emailConfirmed: true, // Set to true for admin user
        profile: {
          create: userData.profile
        }
      },
      include: {
        profile: {
          include: {
            role: true
          }
        }
      }
    })

    console.log('✅ User created successfully!')
    console.log('📧 Email:', user.email)
    console.log('👤 Name:', user.profile?.fullName)
    console.log('🔑 Password:', userData.password) // Show the plain password for reference
    console.log('🆔 User ID:', user.id)
    console.log('📅 Created:', user.createdAt)

    return user
  } catch (error) {
    console.error('❌ Error creating user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Function to create a regular user
async function createRegularUser() {
  try {
    const userData = {
      email: 'user@sambatours.com',
      password: 'user123',
      profile: {
        fullName: 'Regular User',
        firstName: 'Regular',
        lastName: 'User',
        phone: '+256 700 654 321',
        country: 'Uganda',
        city: 'Entebbe',
        roleId: 1, // Regular user role
        isActive: true
      }
    }

    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds)

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash: hashedPassword,
        emailConfirmed: true,
        profile: {
          create: userData.profile
        }
      },
      include: {
        profile: {
          include: {
            role: true
          }
        }
      }
    })

    console.log('✅ Regular user created successfully!')
    console.log('📧 Email:', user.email)
    console.log('👤 Name:', user.profile?.fullName)
    console.log('🔑 Password:', userData.password)
    console.log('🆔 User ID:', user.id)

    return user
  } catch (error) {
    console.error('❌ Error creating regular user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Function to create user roles if they don't exist
async function createUserRoles() {
  try {
    const roles = [
      {
        roleName: 'admin',
        description: 'Administrator with full access'
      },
      {
        roleName: 'user',
        description: 'Regular user with limited access'
      },
      {
        roleName: 'staff',
        description: 'Staff member with moderate access'
      }
    ]

    for (const role of roles) {
      await prisma.userRole.upsert({
        where: { roleName: role.roleName },
        update: {},
        create: role
      })
    }

    console.log('✅ User roles created/updated successfully!')
  } catch (error) {
    console.error('❌ Error creating user roles:', error)
    throw error
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting user creation script...\n')

  try {
    // First create user roles
    await createUserRoles()
    console.log('')

    // Create admin user
    await createUser()
    console.log('')

    // Create regular user
    await createRegularUser()
    console.log('')

    console.log('🎉 All users created successfully!')
    console.log('\n📋 Login Credentials:')
    console.log('Admin: admin@sambatours.com / admin123')
    console.log('User: user@sambatours.com / user123')
  } catch (error) {
    console.error('💥 Script failed:', error)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}

export { createUser, createRegularUser, createUserRoles } 