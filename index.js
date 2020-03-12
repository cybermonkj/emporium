const contractSource = `

payable contract Registration =

    type i = int
    type s = string
    type a = address
    record chainee = {
        chainee : s,
        email : s,
        salary : i,
        jobType : s,
        hours : i,
        company : s,
        js : s,
        hired : int,
        ownerAddress : a,
        id : i}

    record state = {
        chainees : map(i,chainee),
        chaineeLength : i}
 
    entrypoint init() = {chainees = {}, chaineeLength = 0}

    entrypoint chaineeLength() = 
        state.chaineeLength

    entrypoint getchaineeById(index : int)= 
        state.chainees[index]
        


    stateful entrypoint register(newchainee:s, newEmail :s, newsalary :i, newjobType :s, workingHours : i, jobSample : s) = 
        let newChainee = {
            chainee = newchainee,
            jobType = newjobType,
            email = newEmail,
            salary = newsalary,
            hours = workingHours,
            js = jobSample,
            hired = 0,

            id = chaineeLength() + 1,
            ownerAddress = Call.caller}
        let index = chaineeLength() +1

        put(state{chainees[index] = newChainee, chaineeLength = index})

        "chainee has been added successfully"


    stateful payable entrypoint hireChainee(index : i) = 
        let employeeAddress = getchaineeById(index).ownerAddress
        require(Call.caller != employeeAddress, "You cannot hire yourself;)")

        // require(state.chainees[index].hired == false, "THis jobTypeer has been hired by another company" )

        let toBeHired = getChaineeById(index)
        Chain.spend(toBeHired.ownerAddress, toBeHired.salary)
        let hired = state.chainees[index].hired +1

        put(state{Chainees[index].hired = hired })
        "Hired successfully"



`;

const contractAddress = "ct_h9iy5fdMqqVhUK7Ncv5cJjrxEbz68b9E9NEzbgMz1JRr8W2hr";
client = null;
ChaineeArray = [];

function renderProduct() {
 
  var template = $('#template').html();

  Mustache.parse(template);
  var rendered = Mustache.render(template, {
    ChaineeArray
  });




  $('#ChainSection').html(rendered);
  console.log("Rendered")
}

async function callStatic(func, args) {

  const contract = await client.getContractInstance(contractSource, {
    contractAddress
  });

  const calledGet = await contract.call(func, args, {
    callStatic: true
  }).catch(e => console.error(e));

  const decodedGet = await calledGet.decode().catch(e => console.error(e));

  return decodedGet;
}

async function contractCall(func, args, value) {
  const contract = await client.getContractInstance(contractSource, {
    contractAddress
  });
  //Make a call to write smart contract func, with aeon value input
  const calledSet = await contract.call(func, args, {
    amount: value
  }).catch(e => console.error(e));

  return calledSet;
}



// test



document.addEventListener('DOMContentLoaded', async () => {

  $("#loadings").show();
  $('#registerSection').hide();


  const node = await IpfsHttpClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',

  })
  console.log(node)
  window.node = node

  $("#loadings").hide();

})
var buffer = null

window.addEventListener('load', async () => {
  $("#loadings").show();
  $('#registerSection').hide();

  client = await Ae.Aepp()

  gameLength = await callStatic('chaineeLength', []);



  for (let i = 1; i <= gameLength; i++) {
    const newChainee = await callStatic('getChaineeById', [i]);
    console.log("pushing to array")

    var random  = newchainee.chainee
    var randomletter  = random.charAt(0)

    ChaineeArray.push({
      id: newchainee.id,
      chainee: newchainee.chainee,
      email: newchainee.email,
      salary: newchainee.salary,
      hired: newchainee.hired,
      owner: newchainee.ownerAddress,
      hash: newchainee.js,
      jobType : newchainee.jobType,
      hours : newchainee.hours,
      company : newchainee.company,
      randomLetter: randomletter

    })
  }

  renderProduct();
  console.log("pushed succeessfully")
  $("#loadings").hide();
});



// This connects youtopublic ipfs gateway
const ipfs = window.IpfsHttpClient('ipfs.infura.io', '5001', { protocol: 'https' });

// Converts the uploaded file to a buffer which is required to upload to an ipfs node
async function uploadFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const buffer = Buffer.from(reader.result)
      ipfs.add(buffer)
        .then(files => {
          resolve(files)
        })
        .catch(error => reject(error))
    }
    reader.readAsArrayBuffer(file)
  })
}




// Register chainee
$('#submitBtn').click(async function () {
  $("#loadings").show();

  var chainee = ($('#newchainee').val()),

  salary = ($('#newsalary').val());

  email = ($('#newEmail').val());

  hours = ($('#workingHours').val());

  jobType = ($('#newjobType').val());

  // image = ($('#image').val());

  // gets the uploaded file

  newfile = document.getElementById('addedFile')


  console.log(newfile)
  console.log(newfile.files[0])

  file = newfile.files[0]

  // waits for the uploadFile function to be called
  const files = await uploadFile(file)
  const multihash = files[0].hash

  salarys = parseInt(salary, 10)
  var random  = chainee
  var randomletter  = random.charAt(0)
  reggame = await contractCall('register', [chainee, email, salary, jobType, hours, company, multihash], 0)
  console.log(multihash)




  ChaineeArray.push({
    id: ChaineeArray.length + 1,
    chainee: chainee,
    hash: multihash,
    salary: salarys,
    email : email,
    company : company,
    jobType : jobType,
    hours : hours,
    randomLetter : randomletter



  })
  location.reload((true))
  renderProduct();
  $("#loadings").hide();
});










$("#ChainSection").on("click", ".hirebutton", async function (event) {
  $("#loadings").show();
  console.log("Hiring jobTypeer")

  // targets the element being clicked
  dataIndex = event.target.id
  console.log("dataindex", dataIndex)

  // calls the getGame function from the smart contract
  chainee = await callStatic('getchaineeById', [dataIndex])

  chaineesalary = parseInt(chainee.salary, 10)
  console.log(chaineesalary)


  await contractCall('hireChainee', [dataIndex], chaineesalary )

  renderProduct();

  console.log("Hired successfully, contact your jobTypeer")
  
  $("#loadings").hide();
});


$("#ChainSection").on( "click", ".downloadCVButton", async function (event) {
  $("#loadings").show();

  console.log("Downloading CV ")

  // targets the element being clicked
  dataIndex = event.target.id
  console.log("dataindex=", dataIndex)

  // calls the getChaineeById function from the smart contract
  js = await callStatic('getChaineeById', [dataIndex])
  console.log("GET CV")
  console.log("https://ipfs.io/ipfs/" + js.js)
  
  $("#loadings").hide();
});

// Show the Register form

$('#registerChain').click( function(event){
  console.log("Showing register form")
  $('#registerSection').show();
  $('#ChainSection').hide();

})

// Show the registered chainees

$('#chainLink').click( function(event){
  console.log("Showing list of chainee")
  $('#newChainSection').hide();
  $('#ChainSection').show();

})

// Go back to the default page
$('#homeLink').click( function(event){
  console.log("Showing home")

  location.reload(true)
  

})
